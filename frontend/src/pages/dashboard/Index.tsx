import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator.tsx';
import UpcomingDoseCard from '@/components/dashboard/UpcomingDoseCard';
import RemainingMedsCard from '@/components/dashboard/RemainingMedsCard';
import HistoryCard from '@/components/dashboard/HistoryCard';
import HistoryLineChart from '@/components/dashboard/HistoryLineChart';
import { useAuth } from '@/auth/AuthProvider';
import { logsApi, schedulesApi, stockApi, pairingApi } from '@/lib/api';
import { toast } from '@/lib/toast';

type HistoryCardItem = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  status: string;
  statusClassName: string;
};

type UpcomingDose = {
  id: string;
  timeLabel: string;
  etaLabel: string;
  medicineLabel: string;
  quantityLabel: string;
};

export default function DashboardHome() {
  const { auth } = useAuth();
  const firstName = auth.status === 'authed' ? auth.user.first_name : 'User';
  const [viewingUserId, setViewingUserId] = useState(
    () => localStorage.getItem('turfje:viewing-user') ?? 'self',
  );
  const [viewingName, setViewingName] = useState<string | null>(null);
  const isViewingSelf = viewingUserId === 'self';
  const [recentHistory, setRecentHistory] = useState<HistoryCardItem[]>([]);
  const [stockSummary, setStockSummary] = useState({
    deltaLabel: '0 stuks',
    totalLabel: 'Geen voorraad',
    packLabel: '0 verpakkingen (0 p/verpakking)',
    nextDoseLabel: 'Drempel: 0 stuks',
  });
  const [upcomingDose, setUpcomingDose] = useState<UpcomingDose | null>(null);
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

  const formatTimeLabel = (value: string) => {
    console.log('time', value);

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    });
  };

  const formatEtaLabel = (value: Date) => {
    const now = new Date();
    const diffMs = value.getTime() - now.getTime();
    if (diffMs <= 0) return 'Nu';
    const diffMinutes = Math.round(diffMs / 60000);
    if (diffMinutes < 60) return `Over ${diffMinutes} min`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `Over ${diffHours} uur`;
    const diffDays = Math.round(diffHours / 24);
    return `Over ${diffDays} dagen`;
  };

  const loadUpcomingDose = async (targetUserId = viewingUserId) => {
    try {
      const schedules = await schedulesApi.list(
        targetUserId === 'self' ? {} : { user_id: targetUserId },
      );
      const now = new Date();
      const next = schedules
        .map((schedule) => ({
          schedule,
          nextDate: schedule.next_occurrence
            ? new Date(schedule.next_occurrence)
            : null,
        }))
        .filter((item) => item.nextDate && item.nextDate > now)
        .sort((a, b) => a.nextDate!.getTime() - b.nextDate!.getTime())[0];

      if (!next) {
        setUpcomingDose(null);
        return;
      }

      const { schedule, nextDate } = next;
      setUpcomingDose({
        id: schedule.id,
        timeLabel: formatTimeLabel(
          schedule.next_occurrence ?? nextDate!.toISOString(),
        ),
        etaLabel: formatEtaLabel(nextDate!),
        medicineLabel: schedule.medicijn_naam ?? 'Onbekend',
        quantityLabel: `${schedule.aantal ?? 1} stuks`,
      });
    } catch (error) {
      toast.error(
        (error as Error).message || 'Aankomende inname laden mislukt.',
      );
    }
  };

  const loadViewingName = async (targetUserId = viewingUserId) => {
    if (targetUserId === 'self') {
      setViewingName(null);
      return;
    }
    try {
      const data = await pairingApi.subjects();
      const all = [...(data.full_access || []), ...(data.read_only || [])];
      const found = all.find((s: any) => s.user_id === targetUserId);
      if (found) {
        setViewingName(found.name);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpcomingStatus = async (status: 'optijd' | 'gemist') => {
    if (!upcomingDose) return;
    if (!isViewingSelf) {
      toast.info('Je kunt alleen je eigen inname bijwerken.');
      return;
    }
    try {
      await schedulesApi.updateStatus(upcomingDose.id, status);
      toast.success(
        status === 'optijd'
          ? 'Inname gemarkeerd als op tijd.'
          : 'Inname gemarkeerd als gemist.',
      );
      window.dispatchEvent(new CustomEvent('turfje:log-created'));
      void loadUpcomingDose();
    } catch (error) {
      toast.error((error as Error).message || 'Status bijwerken mislukt.');
    }
  };

  const buildChartData = (
    logs: {
      medicijn_naam: string;
      medicijn_turven: number;
      aangemaakt_op: string;
      status?: string | null;
    }[],
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
      dayLogs.sort(
        (a, b) =>
          new Date(a.aangemaakt_op).getTime() -
          new Date(b.aangemaakt_op).getTime(),
      );

      const labelRaw = weekdayFormatter.format(date);
      const label = labelRaw.charAt(0).toUpperCase() + labelRaw.slice(1);
      const value = dayLogs.reduce(
        (sum, item) => sum + (item.medicijn_turven || 0),
        0,
      );
      const details = dayLogs.map((log) => ({
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

  const loadRecentHistory = async (targetUserId = viewingUserId) => {
    try {
      const data = await logsApi.list(
        targetUserId === 'self' ? {} : { user_id: targetUserId },
      );
      const items = data.slice(0, 2).map((item) => ({
        id: item.id,
        title: item.medicijn_naam,
        detail: `${item.medicijn_turven} stuks`,
        timestamp: formatLogTimestamp(item.aangemaakt_op),
        status: normalizeStatus(item.status),
        statusClassName:
          normalizeStatus(item.status) === 'Gemist'
            ? 'text-xs text-red-400'
            : 'text-xs text-green-400',
      }));
      setRecentHistory(items);
      setChartData(buildChartData(data));
    } catch (error) {
      toast.error((error as Error).message || 'Kon historie niet laden.');
    }
  };

  useEffect(() => {
    console.log('recent', recentHistory);
  }, [recentHistory]);

  const loadStockSummary = async () => {
    try {
      const data = await stockApi.list();
      if (data.length === 0) {
        setStockSummary({
          deltaLabel: '0 stuks',
          totalLabel: 'Geen voorraad',
          packLabel: '0 verpakkingen (0 p/verpakking)',
          nextDoseLabel: 'Drempel: 0 stuks',
        });
        return;
      }

      const statusRank = {
        'Bijna leeg': 0,
        'Bijna op': 1,
        'Op peil': 2,
      } as const;

      const sorted = [...data].sort((a, b) => {
        const rankA = statusRank[a.status] ?? 3;
        const rankB = statusRank[b.status] ?? 3;
        if (rankA !== rankB) return rankA - rankB;
        const packsA = a.packs_count ?? a.strips_count ?? 0;
        const perA = a.pills_per_pack ?? a.pills_per_strip ?? 0;
        const packsB = b.packs_count ?? b.strips_count ?? 0;
        const perB = b.pills_per_pack ?? b.pills_per_strip ?? 0;
        const totalA = packsA * perA;
        const totalB = packsB * perB;
        return totalA - totalB;
      });

      const item = sorted[0];
      const packsCount = item.packs_count ?? item.strips_count ?? 0;
      const pillsPerPack = item.pills_per_pack ?? item.pills_per_strip ?? 0;
      const totalPills = packsCount * pillsPerPack + item.loose_pills;
      const delta = totalPills - item.threshold;
      const deltaLabel = `${delta >= 0 ? '+' : ''}${delta} stuks`;

      setStockSummary({
        deltaLabel,
        totalLabel: `${totalPills} ${item.name}`,
        packLabel: `${packsCount} verpakkingen (${pillsPerPack} p/verpakking) - ${item.loose_pills} los`,
        nextDoseLabel: `Drempel: ${item.threshold} stuks`,
      });
    } catch (error) {
      toast.error((error as Error).message || 'Kon voorraad niet laden.');
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('turfje:viewing-user') ?? 'self';
    if (stored !== viewingUserId) {
      setViewingUserId(stored);
    }
    void loadRecentHistory(stored);
    void loadStockSummary();
    void loadUpcomingDose(stored);
    void loadViewingName(stored);
    const handleLogCreated = () => {
      void loadRecentHistory();
      void loadUpcomingDose();
    };
    const handleViewingChange = () => {
      const next = localStorage.getItem('turfje:viewing-user') ?? 'self';
      setViewingUserId(next);
      void loadRecentHistory(next);
      void loadUpcomingDose(next);
      void loadViewingName(next);
    };
    window.addEventListener('turfje:log-created', handleLogCreated);
    window.addEventListener('turfje:viewing-user-changed', handleViewingChange);
    return () => {
      window.removeEventListener('turfje:log-created', handleLogCreated);
      window.removeEventListener(
        'turfje:viewing-user-changed',
        handleViewingChange,
      );
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Overview{viewingName ? ` - ${viewingName}` : ''}
        </h1>
        <p className="text-sm text-muted-foreground">
          Welkom terug {firstName}. Hier is je dashboard
        </p>
      </div>
      <Separator className="my-6" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <UpcomingDoseCard
          timeLabel={upcomingDose?.timeLabel ?? 'Geen geplande inname'}
          medicineLabel={upcomingDose?.medicineLabel ?? 'Geen medicijn'}
          quantityLabel={upcomingDose?.quantityLabel ?? '-'}
          etaLabel={upcomingDose?.etaLabel ?? 'Geen'}
          hasUpcoming={Boolean(upcomingDose)}
          onTaken={() => handleUpcomingStatus('optijd')}
          onMissed={() => handleUpcomingStatus('gemist')}
          actionsDisabled={!upcomingDose || !isViewingSelf}
        />
        <RemainingMedsCard
          title="Medicijnen over"
          deltaLabel={stockSummary.deltaLabel}
          totalLabel={stockSummary.totalLabel}
          packLabel={stockSummary.packLabel}
          nextDoseLabel={stockSummary.nextDoseLabel}
        />
        <HistoryCard items={recentHistory} />
      </div>

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
  );
}
