import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator.tsx";
import UpcomingDoseCard from "@/components/dashboard/UpcomingDoseCard";
import RemainingMedsCard from "@/components/dashboard/RemainingMedsCard";
import HistoryCard from "@/components/dashboard/HistoryCard";
import HistoryLineChart from "@/components/dashboard/HistoryLineChart";
import { useAuth } from "@/auth/AuthProvider";
import { logsApi, stockApi } from "@/lib/api";
import { toast } from "sonner";

type HistoryCardItem = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  status: string;
  statusClassName: string;
};

export default function DashboardHome() {
  const { auth } = useAuth();
  const firstName = auth.status === "authed" ? auth.user.first_name : "User";
  const [recentHistory, setRecentHistory] = useState<HistoryCardItem[]>([]);
  const [stockSummary, setStockSummary] = useState({
    deltaLabel: "0 stuks",
    totalLabel: "Geen voorraad",
    packLabel: "0 Strips (0 p/strip)",
    nextDoseLabel: "Drempel: 0 stuks",
  });
  const [chartData, setChartData] = useState<
    {
      label: string;
      value: number;
      details?: { time: string; status: "Op tijd" | "Gemist"; medicine: string }[];
    }[]
  >([]);

  const formatLogTimestamp = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const normalizeStatus = (status?: string | null) => {
    if (!status) return "Op tijd" as const;
    const lowered = status.toLowerCase();
    if (lowered.includes("gemist")) return "Gemist" as const;
    if (lowered.includes("op_tijd") || lowered.includes("op tijd")) return "Op tijd" as const;
    return "Op tijd" as const;
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
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate(),
      ).padStart(2, "0")}`;

    const logsByDay = new Map<string, typeof logs>();
    logs.forEach((log) => {
      const date = new Date(log.aangemaakt_op);
      if (Number.isNaN(date.getTime())) return;
      const key = keyForDate(date);
      const existing = logsByDay.get(key) ?? [];
      existing.push(log);
      logsByDay.set(key, existing);
    });

    const weekdayFormatter = new Intl.DateTimeFormat("nl-NL", { weekday: "short" });
    const timeFormatter = new Intl.DateTimeFormat("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
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

  const loadRecentHistory = async () => {
    try {
      const data = await logsApi.list();
      const items = data.slice(0, 2).map((item) => ({
        id: item.id,
        title: item.medicijn_naam,
        detail: `${item.medicijn_turven} stuks`,
        timestamp: formatLogTimestamp(item.aangemaakt_op),
        status: normalizeStatus(item.status),
        statusClassName:
          normalizeStatus(item.status) === "Gemist"
            ? "text-xs text-red-400"
            : "text-xs text-green-400",
      }));
      setRecentHistory(items);
      setChartData(buildChartData(data));
    } catch (error) {
      toast.error((error as Error).message || "Kon historie niet laden.");
    }
  };

  const loadStockSummary = async () => {
    try {
      const data = await stockApi.list();
      if (data.length === 0) {
        setStockSummary({
          deltaLabel: "0 stuks",
          totalLabel: "Geen voorraad",
          packLabel: "0 Strips (0 p/strip)",
          nextDoseLabel: "Drempel: 0 stuks",
        });
        return;
      }

      const statusRank = {
        "Bijna leeg": 0,
        "Bijna op": 1,
        "Op peil": 2,
      } as const;

      const sorted = [...data].sort((a, b) => {
        const rankA = statusRank[a.status] ?? 3;
        const rankB = statusRank[b.status] ?? 3;
        if (rankA !== rankB) return rankA - rankB;
        const totalA = a.strips_count * a.pills_per_strip;
        const totalB = b.strips_count * b.pills_per_strip;
        return totalA - totalB;
      });

      const item = sorted[0];
      const totalPills = item.strips_count * item.pills_per_strip + item.loose_pills;
      const delta = totalPills - item.threshold;
      const deltaLabel = `${delta >= 0 ? "+" : ""}${delta} stuks`;

      setStockSummary({
        deltaLabel,
        totalLabel: `${totalPills} ${item.name}`,
        packLabel: `${item.strips_count} Strips (${item.pills_per_strip} p/strip) · ${item.loose_pills} los`,
        nextDoseLabel: `Drempel: ${item.threshold} stuks`,
      });
    } catch (error) {
      toast.error((error as Error).message || "Kon voorraad niet laden.");
    }
  };

  useEffect(() => {
    void loadRecentHistory();
    void loadStockSummary();
    const handleLogCreated = () => {
      void loadRecentHistory();
    };
    window.addEventListener("turfje:log-created", handleLogCreated);
    return () => {
      window.removeEventListener("turfje:log-created", handleLogCreated);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Welkom terug {firstName}. Hier is je dashboard
        </p>
      </div>
      <Separator className="my-6" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <UpcomingDoseCard
          timeLabel="14:00 uur"
          medicineLabel="Paracetamol 500/50mg"
          quantityLabel="2 stuks"
          etaLabel="Over 2 uur"
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
