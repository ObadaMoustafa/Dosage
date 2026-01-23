import { Separator } from "@/components/ui/separator.tsx";
import UpcomingDoseCard from "@/components/dashboard/UpcomingDoseCard";
import RemainingMedsCard from "@/components/dashboard/RemainingMedsCard";
import HistoryCard from "@/components/dashboard/HistoryCard";
import HistoryLineChart from "@/components/dashboard/HistoryLineChart";
import { useAuth } from "@/auth/AuthProvider";

export default function DashboardHome() {
    const { auth } = useAuth();
    const firstName = auth.status === 'authed' ? auth.user.first_name : 'User';

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
          deltaLabel="-2 stuks"
          totalLabel="28 Paracetamol"
          packLabel="3 Strips (10 p/strip)"
          nextDoseLabel="-2 om 14:00 uur"
        />
        <HistoryCard
          items={[
            {
              id: "history-1",
              title: "Paracetamol 500/50mg",
              detail: "3 Strips (10 p/strip) · 2 stuks",
              timestamp: "24-01-2026 · 14:00",
              status: "Op tijd",
              statusClassName: "text-xs text-green-400",
            },
            {
              id: "history-2",
              title: "Paracetamol 500/50mg",
              detail: "1 Strip · 2 stuks",
              timestamp: "23-01-2026 · 20:00",
              status: "Gemist",
              statusClassName: "text-xs text-red-400",
            },
          ]}
        />
      </div>

      <HistoryLineChart
        title="Inname Historie"
        description="Laatste 7 dagen"
        trendLabel="1x minder vergeten dan vorige week! Goed bezig!"
        footerLabel="Aantal innames per dag (laatste 7 dagen)"
        data={[
          {
            label: "Ma",
            value: 3,
            details: [
              { time: "08:00", status: "Op tijd", medicine: "Paracetamol" },
              { time: "12:00", status: "Op tijd", medicine: "Omeprazol" },
              { time: "20:00", status: "Gemist", medicine: "Paracetamol" },
            ],
          },
          {
            label: "Di",
            value: 3,
            details: [
              { time: "09:00", status: "Op tijd", medicine: "Omeprazol" },
              { time: "14:00", status: "Op tijd", medicine: "Paracetamol" },
              { time: "20:00", status: "Gemist", medicine: "Paracetamol" },
            ],
          },
          {
            label: "Wo",
            value: 2,
            details: [
              { time: "08:00", status: "Op tijd", medicine: "Omeprazol" },
              { time: "18:00", status: "Op tijd", medicine: "Paracetamol" },
            ],
          },
          {
            label: "Do",
            value: 3,
            details: [
              { time: "09:00", status: "Op tijd", medicine: "Omeprazol" },
              { time: "14:00", status: "Gemist", medicine: "Paracetamol" },
              { time: "20:00", status: "Op tijd", medicine: "Paracetamol" },
            ],
          },
          {
            label: "Vr",
            value: 2,
            details: [
              { time: "12:00", status: "Op tijd", medicine: "Omeprazol" },
              { time: "19:00", status: "Gemist", medicine: "Paracetamol" },
            ],
          },
          {
            label: "Za",
            value: 1,
            details: [{ time: "09:00", status: "Op tijd", medicine: "Omeprazol" }],
          },
          {
            label: "Zo",
            value: 2,
            details: [
              { time: "14:00", status: "Op tijd", medicine: "Paracetamol" },
              { time: "20:00", status: "Op tijd", medicine: "Omeprazol" },
            ],
          },
        ]}
        seriesLabel="Innames"
        seriesColor="#4963b3"
      />
    </div>
  );
}
