import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";
import DrawerScheduleCreate from "@/components/DrawerScheduleCreate";
import ScheduleTableRow, { type ScheduleRow } from "@/components/ScheduleTableRow";
import { medicinesApi, schedulesApi, type ScheduleApi } from "@/lib/api";
import { toast } from "sonner";

const allDays = [
  "Maandag",
  "Dinsdag",
  "Woensdag",
  "Donderdag",
  "Vrijdag",
  "Zaterdag",
  "Zondag",
];

const formatInterval = (days: string[], times: string[]) => {
  const isDaily =
    days.length === allDays.length && allDays.every((day) => days.includes(day));
  const dayLabel = isDaily ? "Elke dag" : days.join(", ");
  const timeLabel = times.length ? `om ${times.join(", ")} uur` : "";
  return `${dayLabel} ${timeLabel}`.trim();
};

export default function DashboardSchedules() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [schedules, setSchedules] = React.useState<ScheduleRow[]>([]);
  const [medicineOptions, setMedicineOptions] = React.useState<
    { id: string; label: string }[]
  >([]);

  const dayKeyToLabel: Record<string, string> = {
    maandag: "Maandag",
    dinsdag: "Dinsdag",
    woensdag: "Woensdag",
    donderdag: "Donderdag",
    vrijdag: "Vrijdag",
    zaterdag: "Zaterdag",
    zondag: "Zondag",
  };

  const buildDaysObject = (days: string[]) => {
    const lower = days.map((day) => day.toLowerCase());
    return Object.keys(dayKeyToLabel).reduce(
      (acc, key) => {
        acc[key] = lower.includes(key);
        return acc;
      },
      {} as Record<string, boolean>,
    );
  };

  const mapSchedule = (schedule: ScheduleApi): ScheduleRow => ({
    id: schedule.id,
    gmnId: schedule.gmn_id,
    medicine: schedule.medicijn_naam,
    count: schedule.aantal,
    description: schedule.beschrijving,
    days: Object.entries(schedule.dagen)
      .filter(([, value]) => value)
      .map(([key]) => dayKeyToLabel[key] ?? key),
    times: schedule.tijden ?? [],
  });

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const data = await schedulesApi.list();
      setSchedules(data.map(mapSchedule));
    } catch (error) {
      toast.error((error as Error).message || "Schema's laden mislukt.");
    } finally {
      setLoading(false);
    }
  };

  const loadMedicines = async () => {
    try {
      const data = await medicinesApi.listMy();
      setMedicineOptions(
        data.map((item) => ({ id: item.id, label: item.medicijn_naam })),
      );
    } catch (error) {
      toast.error((error as Error).message || "Medicijnen laden mislukt.");
    }
  };

  React.useEffect(() => {
    void loadSchedules();
    void loadMedicines();
  }, []);

  const handleCreate = async (payload: {
    gmnId: string;
    count: number;
    description: string;
    days: string[];
    times: string[];
  }) => {
    try {
      const id = await schedulesApi.create({
        gmn_id: payload.gmnId,
        aantal: payload.count,
        beschrijving: payload.description,
        dagen: buildDaysObject(payload.days),
        tijden: payload.times,
      });
      const created: ScheduleRow = {
        id: id ?? `temp-${Date.now()}`,
        gmnId: payload.gmnId,
        medicine:
          medicineOptions.find((option) => option.id === payload.gmnId)?.label ??
          "Onbekend",
        count: payload.count,
        description: payload.description,
        days: payload.days,
        times: payload.times,
      };
      setSchedules((prev) => [created, ...prev]);
      toast.success("Schema toegevoegd.");
      return true;
    } catch (error) {
      toast.error((error as Error).message || "Schema toevoegen mislukt.");
      return false;
    }
  };

  const handleUpdate = async (next: ScheduleRow) => {
    if (!next.id || !next.gmnId) {
      setSchedules((prev) =>
        prev.map((item) => (item.id === next.id ? next : item)),
      );
      return true;
    }
    try {
      await schedulesApi.update(next.id, {
        gmn_id: next.gmnId,
        aantal: next.count,
        beschrijving: next.description,
        dagen: buildDaysObject(next.days),
        tijden: next.times,
      });
      setSchedules((prev) =>
        prev.map((item) => (item.id === next.id ? next : item)),
      );
      toast.success("Schema bijgewerkt.");
      return true;
    } catch (error) {
      toast.error((error as Error).message || "Schema bijwerken mislukt.");
      return false;
    }
  };

  const handleDelete = async (schedule: ScheduleRow) => {
    if (!schedule.id) {
      setSchedules((prev) => prev.filter((item) => item.id !== schedule.id));
      return true;
    }
    try {
      await schedulesApi.remove(schedule.id);
      setSchedules((prev) => prev.filter((item) => item.id !== schedule.id));
      toast.success("Schema verwijderd.");
      return true;
    } catch (error) {
      toast.error((error as Error).message || "Schema verwijderen mislukt.");
      return false;
    }
  };

  const handleStatus = async (schedule: ScheduleRow, status: "optijd" | "gemist") => {
    if (!schedule.id) return;
    try {
      await schedulesApi.updateStatus(schedule.id, status);
      toast.success(
        status === "optijd"
          ? "Inname gemarkeerd als op tijd."
          : "Inname gemarkeerd als gemist.",
      );
      if (status === "optijd") {
        window.dispatchEvent(new CustomEvent("turfje:log-created"));
      }
    } catch (error) {
      toast.error((error as Error).message || "Status bijwerken mislukt.");
    }
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const intervalLabel = formatInterval(schedule.days, schedule.times);
    return (
      schedule.medicine.toLowerCase().includes(query) ||
      schedule.count.toLowerCase().includes(query) ||
      intervalLabel.toLowerCase().includes(query) ||
      schedule.description.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Schema&apos;s</h1>
        <p className="text-sm text-muted-foreground">
          Beheer je schema&apos;s en voeg nieuwe toe.
        </p>
      </div>
      <Separator className="my-6" />

      <Card className="bg-[#1b2441] border-border/60">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-base">Je schema&apos;s</CardTitle>
            <DrawerScheduleCreate
              onSubmit={handleCreate}
              medicineOptions={medicineOptions}
            />
          </div>
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 bg-background/10 border-border/60"
              placeholder="Zoeken door je schema's"
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
                <TableHead>Aantal</TableHead>
                <TableHead>Beschrijving</TableHead>
                <TableHead>Interval</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchedules.map((schedule) => {
                const intervalLabel = formatInterval(
                  schedule.days,
                  schedule.times,
                );
                return (
                  <ScheduleTableRow
                    key={schedule.id ?? `${schedule.medicine}-${intervalLabel}`}
                    schedule={schedule}
                    intervalLabel={intervalLabel}
                    onEdit={handleUpdate}
                    onDelete={() => handleDelete(schedule)}
                    onStatusChange={(status) => handleStatus(schedule, status)}
                  />
                );
              })}
            </TableBody>
          </Table>

          <div className="text-xs text-muted-foreground">
            {loading ? "Schema's laden..." : `${filteredSchedules.length} actieve schema's`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
