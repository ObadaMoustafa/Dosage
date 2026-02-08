import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Separator } from '@/components/ui/separator.tsx';
import { type MedicineRow } from '@/components/DrawerMedicineEdit';
import DrawerMedicineCreate, {
  type CreateMedicinePayload,
} from '@/components/DrawerMedicineCreate';
import MedicineTableRow from '@/components/MedicineTableRow';
import { formatStockLabel, type StockItem } from '@/data/stock';
import {
  medicinesApi,
  stockApi,
  pairingApi,
  type ApiMedicine,
} from '@/lib/api';
import { toast } from '@/lib/toast';

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
  const [viewingName, setViewingName] = React.useState<string | null>(null);
  const [isReadOnly, setIsReadOnly] = React.useState(false);
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

    const loadViewingName = async () => {
      const viewingUserId =
        localStorage.getItem('turfje:viewing-user') ?? 'self';
      if (viewingUserId === 'self') {
        if (mounted) {
          setViewingName(null);
          setIsReadOnly(false);
        }
        return;
      }
      try {
        const data = await pairingApi.subjects();
        if (!mounted) return;

        const readOnly = (data.read_only || []).find(
          (s: any) => s.user_id === viewingUserId,
        );
        if (readOnly) {
          setViewingName(readOnly.name);
          setIsReadOnly(true);
        } else {
          const fullAccess = (data.full_access || []).find(
            (s: any) => s.user_id === viewingUserId,
          );
          if (fullAccess) {
            setViewingName(fullAccess.name);
            setIsReadOnly(false);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    void loadMedicines();
    void loadStock();
    void loadViewingName();

    const handleStockUpdate = () => {
      void loadStock();
    };
    window.addEventListener('turfje:stock-updated', handleStockUpdate);

    const handleViewingChange = () => {
      void loadMedicines();
      void loadStock();
      void loadViewingName();
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

      const viewingUserId =
        localStorage.getItem('turfje:viewing-user') ?? 'self';
      const createPayload: any = {
        medicijn_naam: payload.name.trim(),
        toedieningsvorm: payload.route || null,
        sterkte: payload.strength || null,
        beschrijving: payload.description || null,
        bijsluiter: leaflet || null,
        stock_id: payload.stockId ?? null,
      };
      if (viewingUserId !== 'self') {
        createPayload.user_id = viewingUserId;
      }
      const id = await medicinesApi.create(createPayload);
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
        <h1 className="text-2xl font-semibold tracking-tight">
          Medicijnen{viewingName ? ` - ${viewingName}` : ''}
        </h1>
        <p className="text-sm text-muted-foreground">
          Beheer je medicijnen en voeg nieuwe toe.
        </p>
      </div>
      <Separator className="my-6" />

      <Card className="bg-[#1b2441] border-border/60">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-base">Medicijnen</CardTitle>
            {!isReadOnly && (
              <DrawerMedicineCreate
                onSubmit={handleCreate}
                stockOptions={stockOptions}
              />
            )}
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
          <div className="rounded-md border border-white/10 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[800px]">
              <thead className="bg-white/5 text-muted-foreground font-medium">
                <tr>
                  <th className="p-3">Medicijn</th>
                  <th className="p-3">Toedieningsvorm</th>
                  <th className="p-3">Sterkte</th>
                  <th className="p-3">Beschrijving</th>
                  <th className="p-3">Voorraad</th>
                  <th className="p-3">Bijsluiter</th>
                  {!isReadOnly && <th className="p-3 text-right">Acties</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredMedicines.map((medicine) => (
                  <MedicineTableRow
                    key={medicine.id ?? medicine.name}
                    medicine={medicine}
                    stockById={stockById}
                    onEdit={isReadOnly ? undefined : handleUpdate}
                    onDelete={
                      isReadOnly ? undefined : () => handleDelete(medicine)
                    }
                    stockOptions={stockOptions}
                    isReadOnly={isReadOnly}
                  />
                ))}
              </tbody>
            </table>
          </div>

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
