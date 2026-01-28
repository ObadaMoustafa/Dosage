import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import InventoryTableRow from '@/components/InventoryTableRow';
import DrawerStockCreate from '@/components/DrawerStockCreate';
import { formatStockLabel, type StockItem, type StockStatus } from '@/data/stock';
import { stockApi } from '@/lib/api';
import { toast } from 'sonner';

const statusLabels: Record<'all' | StockStatus, string> = {
  all: 'Alle statussen',
  'Op peil': 'Op peil',
  'Bijna op': 'Bijna op',
  'Bijna leeg': 'Bijna leeg',
};

export default function DashboardVoorraad() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | StockStatus>('all');
  const [loading, setLoading] = useState(true);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return stockItems.filter((item) => {
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        formatStockLabel(item).toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [searchQuery, statusFilter, stockItems]);

  const loadStock = async () => {
    setLoading(true);
    try {
      const data = await stockApi.list();
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
    } catch (error) {
      toast.error((error as Error).message || 'Voorraad laden mislukt.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStock();
  }, []);

  const handleUpdate = async (next: StockItem) => {
    try {
      await stockApi.update(next.id, {
        name: next.name,
        packs_count: next.packsCount,
        pills_per_pack: next.pillsPerPack,
        loose_pills: next.loosePills,
        threshold: next.threshold,
        status: next.status,
      });
      setStockItems((prev) => prev.map((item) => (item.id === next.id ? next : item)));
      window.dispatchEvent(new CustomEvent('turfje:stock-updated'));
      toast.success('Voorraad bijgewerkt.');
      return true;
    } catch (error) {
      toast.error((error as Error).message || 'Voorraad bijwerken mislukt.');
      return false;
    }
  };

  const handleCreate = async (next: Omit<StockItem, 'id' | 'lastUpdated'>) => {
    try {
      const id = await stockApi.create({
        name: next.name,
        packs_count: next.packsCount,
        pills_per_pack: next.pillsPerPack,
        loose_pills: next.loosePills,
        threshold: next.threshold,
        status: next.status,
      });
      const created: StockItem = {
        id: id ?? `temp-${Date.now()}`,
        name: next.name,
        packsCount: next.packsCount,
        pillsPerPack: next.pillsPerPack,
        loosePills: next.loosePills,
        threshold: next.threshold,
        status: next.status,
        lastUpdated: new Date().toISOString(),
      };
      setStockItems((prev) => [created, ...prev]);
      window.dispatchEvent(new CustomEvent('turfje:stock-updated'));
      toast.success('Voorraad toegevoegd.');
      return true;
    } catch (error) {
      toast.error((error as Error).message || 'Voorraad toevoegen mislukt.');
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Voorraad</h1>
        <p className="text-sm text-muted-foreground">
          Houd zicht op je voorraad en drempelwaarden.
        </p>
      </div>
      <Separator className="my-6" />

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card className="bg-[#1b2441] border-border/60">
          <CardHeader className="space-y-3 pb-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-base">Voorraad overzicht</CardTitle>
              <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
                <DrawerStockCreate onSave={handleCreate} />
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9 bg-background/10 border-border/60"
                    placeholder="Zoek medicijn"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as 'all' | StockStatus)
                  }
                >
                  <SelectTrigger className="bg-background/10 border-border/60 md:w-44">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicijn</TableHead>
                  <TableHead>Voorraad</TableHead>
                  <TableHead>Drempel</TableHead>
                  <TableHead>Laatst bijgewerkt</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <InventoryTableRow key={item.id} item={item} onEdit={handleUpdate} />
                ))}
              </TableBody>
            </Table>
            <div className="text-xs text-muted-foreground">
              {loading ? 'Voorraad laden...' : `${filteredItems.length} items`}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1b2441] border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Samenvatting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Totaal medicijnen</span>
              <span className="font-semibold">{stockItems.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Bijna op</span>
              <span className="font-semibold text-amber-400">
                {stockItems.filter((item) => item.status === 'Bijna op').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Bijna leeg</span>
              <span className="font-semibold text-red-400">
                {stockItems.filter((item) => item.status === 'Bijna leeg').length}
              </span>
            </div>
            <div className="rounded-md bg-background/10 p-3 text-xs text-muted-foreground">
              Stel drempels in om tijdig bij te bestellen.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
