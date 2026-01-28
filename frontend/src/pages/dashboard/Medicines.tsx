import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search } from 'lucide-react';
import { Separator } from '@/components/ui/separator.tsx';
import { type MedicineRow } from '@/components/DrawerMedicineEdit';
import DrawerMedicineCreate, {
  type CreateMedicinePayload,
} from '@/components/DrawerMedicineCreate';
import MedicineTableRow from '@/components/MedicineTableRow';
import { formatStockLabel, type StockItem } from '@/data/stock';
import { medicinesApi, stockApi, type ApiMedicine } from '@/lib/api';
import { toast } from 'sonner';

const mapApiMedicine = (medicine: ApiMedicine): MedicineRow => ({
  id: medicine.id,
  name: medicine.medicijn_naam ?? '',
  brand: '',
  route: medicine.toedieningsvorm ?? '',
  strength: medicine.sterkte ?? '',
  description: medicine.beschrijving ?? '',
  leaflet: medicine.bijsluiter ?? '',
  stockId: medicine.stock_id ?? undefined,
});

export default function DashboardMedicines() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [medicines, setMedicines] = React.useState<MedicineRow[]>([]);
  const [stockItems, setStockItems] = React.useState<StockItem[]>([]);
  const stockById = React.useMemo(
    () => new Map(stockItems.map((item) => [item.id, item])),
    [stockItems],
  );
  const stockOptions = React.useMemo(
    () =>
      stockItems.map((item) => ({
        id: item.id,
        label: `${item.name} · ${formatStockLabel(item)}`,
      })),
    [stockItems],
  );

  React.useEffect(() => {
    let mounted = true;
    const loadMedicines = async () => {
      setLoading(true);
      try {
        const viewingUserId =
          localStorage.getItem('turfje:viewing-user') ?? 'self';
        const data = await medicinesApi.listMy(
          viewingUserId === 'self' ? {} : { user_id: viewingUserId },
        );
        if (!mounted) return;
        setMedicines(data.map(mapApiMedicine));
      } catch (error) {
        if (!mounted) return;
        toast.error((error as Error).message || 'Kon medicijnen niet laden.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const loadStock = async () => {
      const viewingUserId =
        localStorage.getItem('turfje:viewing-user') ?? 'self';
      if (viewingUserId !== 'self') {
        setStockItems([]);
        return;
      }
      try {
        const data = await stockApi.list();
        if (!mounted) return;
        const mapped = data.map((item) => ({
          id: item.id,
          name: item.name,
          packsCount: item.packs_count ?? item.strips_count ?? 0,
          pillsPerPack: item.pills_per_pack ?? item.pills_per_strip ?? 0,
          loosePills: item.loose_pills,
          threshold: item.threshold,
          lastUpdated: item.last_updated,
          status: item.status,
        }));
        setStockItems(mapped);
      } finally {
        if (!mounted) return;
      }
    };
    void loadMedicines();
    void loadStock();
    const handleStockUpdate = () => {
      void loadStock();
    };
    window.addEventListener('turfje:stock-updated', handleStockUpdate);
    const handleViewingChange = () => {
      void loadMedicines();
      void loadStock();
    };
    window.addEventListener('turfje:viewing-user-changed', handleViewingChange);
    return () => {
      mounted = false;
      window.removeEventListener('turfje:stock-updated', handleStockUpdate);
      window.removeEventListener(
        'turfje:viewing-user-changed',
        handleViewingChange,
      );
    };
  }, []);

  const handleCreate = async (payload: CreateMedicinePayload) => {
    try {
      const leaflet =
        payload.leafletText || (payload.useFdaLeaflet ? 'FDA' : '');
      const id = await medicinesApi.create({
        medicijn_naam: payload.name.trim(),
        toedieningsvorm: payload.route || null,
        sterkte: payload.strength || null,
        beschrijving: payload.description || null,
        bijsluiter: leaflet || null,
        stock_id: payload.stockId ?? null,
      });
      const next: MedicineRow = {
        id: id ?? `temp-${Date.now()}`,
        name: payload.name,
        brand: payload.brand,
        route: payload.route,
        strength: payload.strength,
        description: payload.description,
        leaflet,
        stockId: payload.stockId,
      };
      setMedicines((prev) => [next, ...prev]);
      window.dispatchEvent(new CustomEvent('turfje:medicines-updated'));
      toast.success('Medicijn toegevoegd.');
    } catch (error) {
      toast.error((error as Error).message || 'Medicijn toevoegen mislukt.');
    }
  };

  const handleUpdate = async (next: MedicineRow) => {
    if (!next.id) {
      setMedicines((prev) =>
        prev.map((item) => (item.name === next.name ? next : item)),
      );
      return true;
    }

    try {
      await medicinesApi.update(next.id, {
        medicijn_naam: next.name.trim(),
        toedieningsvorm: next.route || null,
        sterkte: next.strength || null,
        beschrijving: next.description || null,
        bijsluiter: next.leaflet || null,
        stock_id: next.stockId ?? null,
      });
      setMedicines((prev) =>
        prev.map((item) => (item.id === next.id ? next : item)),
      );
      toast.success('Medicijn bijgewerkt.');
      return true;
    } catch (error) {
      toast.error((error as Error).message || 'Medicijn bijwerken mislukt.');
      return false;
    }
  };

  const handleDelete = async (medicine: MedicineRow) => {
    if (!medicine.id) {
      setMedicines((prev) =>
        prev.filter((item) => item.name !== medicine.name),
      );
      return true;
    }

    try {
      await medicinesApi.remove(medicine.id);
      setMedicines((prev) => prev.filter((item) => item.id !== medicine.id));
      toast.success('Medicijn verwijderd.');
      return true;
    } catch (error) {
      toast.error((error as Error).message || 'Medicijn verwijderen mislukt.');
      return false;
    }
  };

  const filteredMedicines = medicines.filter((medicine) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      medicine.name.toLowerCase().includes(query) ||
      medicine.brand.toLowerCase().includes(query) ||
      medicine.route.toLowerCase().includes(query) ||
      medicine.strength.toLowerCase().includes(query) ||
      medicine.description.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Medicijnen</h1>
        <p className="text-sm text-muted-foreground">
          Beheer je medicijnen en voeg nieuwe toe.
        </p>
      </div>
      <Separator className="my-6" />

      <Card className="bg-[#1b2441] border-border/60">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-base">Je medicijnen</CardTitle>
            <DrawerMedicineCreate
              onSubmit={handleCreate}
              stockOptions={stockOptions}
            />
          </div>
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 bg-background/10 border-border/60"
              placeholder="Zoeken door je medicijnen"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicijn</TableHead>
                {/*<TableHead>Merk</TableHead>*/}
                <TableHead>Toedieningsvorm</TableHead>
                <TableHead>Sterkte</TableHead>
                <TableHead>Beschrijving</TableHead>
                <TableHead>Voorraad</TableHead>
                <TableHead>Bijsluiter</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedicines.map((medicine) => (
                <MedicineTableRow
                  key={medicine.id ?? medicine.name}
                  medicine={medicine}
                  stockById={stockById}
                  onEdit={handleUpdate}
                  onDelete={() => handleDelete(medicine)}
                  stockOptions={stockOptions}
                />
              ))}
            </TableBody>
          </Table>

          <div className="text-xs text-muted-foreground">
            {loading
              ? 'Medicijnen laden...'
              : `${filteredMedicines.length} medicijnen`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
