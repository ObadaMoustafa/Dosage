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

const schedules: ScheduleRow[] = [
  {
    medicine: "Omeprazol 20mg",
    count: "1x",
    days: ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"],
    times: ["09:00"],
    description: "Na het ontbijt innemen.",
  },
  {
    medicine: "Paracetamol 500/50mg",
    count: "2x",
    days: ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag"],
    times: ["09:00", "13:00"],
    description: "Innemen bij hoofdpijn | Bijwerking: Hoofdpijn",
  },
];

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
            <DrawerScheduleCreate />
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
                    key={`${schedule.medicine}-${intervalLabel}`}
                    schedule={schedule}
                    intervalLabel={intervalLabel}
                  />
                );
              })}
            </TableBody>
          </Table>

          <div className="text-xs text-muted-foreground">
            {filteredSchedules.length} actieve schema&apos;s
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
