import { useMemo, useState } from 'react';
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
import HistoryTableRow, { type HistoryEntry } from '@/components/HistoryTableRow';
import HistoryLineChart from '@/components/dashboard/HistoryLineChart';

const historyEntries: HistoryEntry[] = [
  {
    id: 'history-1',
    medicine: 'Paracetamol 500/50mg',
    details: '3 Strips (10 p/strip) · 2 stuks',
    scheduledAt: '24-01-2026 · 14:00',
    status: 'Op tijd',
  },
  {
    id: 'history-2',
    medicine: 'Paracetamol 500/50mg',
    details: '1 Strip · 2 stuks',
    scheduledAt: '23-01-2026 · 20:00',
    status: 'Gemist',
  },
  {
    id: 'history-3',
    medicine: 'Omeprazol 20mg',
    details: '1 Strip · 1 stuk',
    scheduledAt: '23-01-2026 · 08:00',
    status: 'Op tijd',
  },
  {
    id: 'history-4',
    medicine: 'Ibuprofen 250mg',
    details: '2 Strips · 1 stuk',
    scheduledAt: '22-01-2026 · 19:00',
    status: 'Gemist',
  },
  {
    id: 'history-5',
    medicine: 'Omeprazol 20mg',
    details: '1 Strip · 1 stuk',
    scheduledAt: '22-01-2026 · 08:00',
    status: 'Op tijd',
  },
];

const chartData = [
  {
    label: 'Ma',
    value: 3,
    details: [
      { time: '08:00', status: 'Op tijd', medicine: 'Paracetamol' },
      { time: '12:00', status: 'Op tijd', medicine: 'Omeprazol' },
      { time: '20:00', status: 'Gemist', medicine: 'Paracetamol' },
    ],
  },
  {
    label: 'Di',
    value: 3,
    details: [
      { time: '09:00', status: 'Op tijd', medicine: 'Omeprazol' },
      { time: '14:00', status: 'Op tijd', medicine: 'Paracetamol' },
      { time: '20:00', status: 'Gemist', medicine: 'Paracetamol' },
    ],
  },
  {
    label: 'Wo',
    value: 2,
    details: [
      { time: '08:00', status: 'Op tijd', medicine: 'Omeprazol' },
      { time: '18:00', status: 'Op tijd', medicine: 'Paracetamol' },
    ],
  },
  {
    label: 'Do',
    value: 3,
    details: [
      { time: '09:00', status: 'Op tijd', medicine: 'Omeprazol' },
      { time: '14:00', status: 'Gemist', medicine: 'Paracetamol' },
      { time: '20:00', status: 'Op tijd', medicine: 'Paracetamol' },
    ],
  },
  {
    label: 'Vr',
    value: 2,
    details: [
      { time: '12:00', status: 'Op tijd', medicine: 'Omeprazol' },
      { time: '19:00', status: 'Gemist', medicine: 'Paracetamol' },
    ],
  },
  {
    label: 'Za',
    value: 1,
    details: [{ time: '09:00', status: 'Op tijd', medicine: 'Omeprazol' }],
  },
  {
    label: 'Zo',
    value: 2,
    details: [
      { time: '14:00', status: 'Op tijd', medicine: 'Paracetamol' },
      { time: '20:00', status: 'Op tijd', medicine: 'Omeprazol' },
    ],
  },
];

export default function DashboardHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | HistoryEntry['status']>(
    'all',
  );

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return historyEntries.filter((entry) => {
      const matchesQuery =
        !query ||
        entry.medicine.toLowerCase().includes(query) ||
        entry.details.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Historie</h1>
        <p className="text-sm text-muted-foreground">
          Bekijk je recente innames en gemiste momenten.
        </p>
      </div>
      <Separator className="my-6" />

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card className="bg-[#1b2441] border-border/60">
          <CardHeader className="space-y-3 pb-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-base">Overzicht</CardTitle>
              <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9 bg-background/10 border-border/60"
                    placeholder="Zoek op medicijn"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as 'all' | HistoryEntry['status'])
                  }
                >
                  <SelectTrigger className="bg-background/10 border-border/60 md:w-44">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle statussen</SelectItem>
                    <SelectItem value="Op tijd">Op tijd</SelectItem>
                    <SelectItem value="Gemist">Gemist</SelectItem>
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
                  <TableHead>Details</TableHead>
                  <TableHead>Moment</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <HistoryTableRow key={entry.id} entry={entry} />
                ))}
              </TableBody>
            </Table>
            <div className="text-xs text-muted-foreground">
              {filteredEntries.length} registraties
            </div>
          </CardContent>
        </Card>

        <HistoryLineChart
          title="Inname Historie"
          description="Laatste 7 dagen"
          trendLabel="1x minder vergeten dan vorige week! Goed bezig!"
          footerLabel="Aantal innames per dag (laatste 7 dagen)"
          data={chartData}
          seriesLabel="Innames"
          seriesColor="#4963b3"
        />
      </div>
    </div>
  );
}
