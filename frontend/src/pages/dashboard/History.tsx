import { useMemo, useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import HistoryTableRow, {
  type HistoryEntry,
} from '@/components/HistoryTableRow';
import HistoryLineChart from '@/components/dashboard/HistoryLineChart';
import { logsApi, pairingApi } from '@/lib/api';
import { toast } from '@/lib/toast';

const formatLogTimestamp = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
};

const normalizeStatus = (status?: string | null) => {
  if (!status) return 'Op tijd' as const;
  const lowered = status.toLowerCase();
  if (lowered.includes('gemist')) return 'Gemist' as const;
  if (
    lowered.includes('optijd') ||
    lowered.includes('op_tijd') ||
    lowered.includes('op tijd')
  )
    return 'Op tijd' as const;
  return 'Op tijd' as const;
};

const buildChartData = (
  logs: {
    medicijn_naam: string;
    medicijn_turven: number;
    aangemaakt_op: string;
    status?: string | null;
  }[],
  statusFilter: 'all' | 'Op tijd' | 'Gemist',
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return date;
  });

  const keyForDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`;

  const logsByDay = new Map<string, typeof logs>();
  logs.forEach((log) => {
    const date = new Date(log.aangemaakt_op);
    if (Number.isNaN(date.getTime())) return;
    const key = keyForDate(date);
    const existing = logsByDay.get(key) ?? [];
    existing.push(log);
    logsByDay.set(key, existing);
  });

  const weekdayFormatter = new Intl.DateTimeFormat('nl-NL', {
    weekday: 'short',
  });
  const timeFormatter = new Intl.DateTimeFormat('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return days.map((date) => {
    const key = keyForDate(date);
    const dayLogs = logsByDay.get(key) ?? [];
    const filteredDayLogs =
      statusFilter === 'all'
        ? dayLogs
        : dayLogs.filter((log) => normalizeStatus(log.status) === statusFilter);
    dayLogs.sort(
      (a, b) =>
        new Date(a.aangemaakt_op).getTime() -
        new Date(b.aangemaakt_op).getTime(),
    );

    const labelRaw = weekdayFormatter.format(date);
    const label = labelRaw.charAt(0).toUpperCase() + labelRaw.slice(1);
    const value = filteredDayLogs.reduce(
      (sum, item) => sum + (item.medicijn_turven || 0),
      0,
    );
    const details = filteredDayLogs.map((log) => ({
      time: timeFormatter.format(new Date(log.aangemaakt_op)),
      status: normalizeStatus(log.status),
      medicine: log.medicijn_naam,
    }));

    return {
      label,
      value,
      details,
    };
  });
};

export default function DashboardHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | HistoryEntry['status']
  >('all');
  const [loading, setLoading] = useState(true);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [viewingName, setViewingName] = useState<string | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [logs, setLogs] = useState<
    {
      id: string;
      medicijn_naam: string;
      medicijn_turven: number;
      aangemaakt_op: string;
      status?: string | null;
    }[]
  >([]);
  const [chartData, setChartData] = useState<
    {
      label: string;
      value: number;
      details?: {
        time: string;
        status: 'Op tijd' | 'Gemist';
        medicine: string;
      }[];
    }[]
  >([]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const viewingUserId =
        localStorage.getItem('turfje:viewing-user') ?? 'self';
      const data = await logsApi.list(
        viewingUserId === 'self' ? {} : { user_id: viewingUserId },
      );
      const entries = data.map((item) => ({
        id: item.id,
        medicine: item.medicijn_naam,
        details: `${item.medicijn_turven} stuks`,
        scheduledAt: formatLogTimestamp(item.aangemaakt_op),
        status: normalizeStatus(item.status),
      }));
      setHistoryEntries(entries);
      setLogs(data);
    } catch (error) {
      toast.error((error as Error).message || 'Kon historie niet laden.');
    } finally {
      setLoading(false);
    }
  };

  const loadViewingName = async () => {
    const viewingUserId = localStorage.getItem('turfje:viewing-user') ?? 'self';
    if (viewingUserId === 'self') {
      setViewingName(null);
      setIsReadOnly(false);
      return;
    }
    try {
      const data = await pairingApi.subjects();
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

  const handleDeleteLog = async (id: string) => {
    try {
      await logsApi.remove(id);
      setHistoryEntries((prev) => prev.filter((entry) => entry.id !== id));
      setLogs((prev) => prev.filter((log) => log.id !== id));
      toast.success('Log verwijderd.');
      window.dispatchEvent(new CustomEvent('turfje:log-created'));
    } catch (error) {
      toast.error((error as Error).message || 'Log verwijderen mislukt.');
    }
  };

  useEffect(() => {
    let mounted = true;
    const runLoad = async () => {
      if (!mounted) return;
      await loadLogs();
      await loadViewingName();
    };

    const handleLogCreated = () => {
      void runLoad();
    };
    const handleViewingChange = () => {
      void runLoad();
    };

    window.addEventListener('turfje:log-created', handleLogCreated);
    window.addEventListener('turfje:viewing-user-changed', handleViewingChange);
    void runLoad();
    return () => {
      mounted = false;
      window.removeEventListener('turfje:log-created', handleLogCreated);
      window.removeEventListener(
        'turfje:viewing-user-changed',
        handleViewingChange,
      );
    };
  }, []);

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return historyEntries.filter((entry) => {
      const matchesQuery =
        !query ||
        entry.medicine.toLowerCase().includes(query) ||
        entry.details.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === 'all' || entry.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [searchQuery, statusFilter, historyEntries]);

  useEffect(() => {
    setChartData(buildChartData(logs, statusFilter));
  }, [logs, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Historie{viewingName ? ` - ${viewingName}` : ''}
        </h1>
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
            <div className="rounded-md border border-white/10 overflow-hidden overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="bg-white/5 text-muted-foreground font-medium">
                  <tr>
                    <th className="p-3">Medicijn</th>
                    <th className="p-3">Details</th>
                    <th className="p-3">Moment</th>
                    <th className="p-3 text-right">Status</th>
                    {!isReadOnly && <th className="p-3 text-right">Acties</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredEntries.map((entry) => (
                    <HistoryTableRow
                      key={entry.id}
                      entry={entry}
                      onDelete={isReadOnly ? undefined : handleDeleteLog}
                      isReadOnly={isReadOnly}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-xs text-muted-foreground">
              {loading
                ? 'Historie laden...'
                : `${filteredEntries.length} registraties`}
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
