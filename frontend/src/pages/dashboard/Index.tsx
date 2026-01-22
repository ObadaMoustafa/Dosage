import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucidePillBottle , LucideTablets, LucideClock, ArrowDownRight } from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {Separator} from "@/components/ui/separator.tsx";

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Welkom terug. Hier is je dashboard.
        </p>
      </div>
      <Separator className="my-6" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-[#1b2441] border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Aankomende Inname</CardTitle>
            <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              <LucideClock className="h-3 w-3"/>
              Over 2 uur
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold mb-1">14:00 uur</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 py-0.5 text-xs font-semibold text-muted-foreground">
                <LucidePillBottle className="h-4 w-4 mr-0.5"/>
                Paracetamol 500/50mg
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 py-0.5 mt-1 text-xs font-semibold text-muted-foreground">
                <LucideTablets className="h-4 w-4 mr-0.5"/>
                2 stuks
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1b2441] border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Medicijnen over</CardTitle>
            <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              <ArrowDownRight className="h-3 w-3"/>
              -2 stuks
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold mb-1">28 Paracetamol</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 py-0.5 text-xs font-semibold text-muted-foreground">
                <LucidePillBottle className="h-4 w-4 mr-0.5"/>
                3 Strips (10 p/strip)
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 py-0.5 mt-1 text-xs font-semibold text-muted-foreground">
                <LucideTablets className="h-4 w-4 mr-0.5"/>
                -2 om 14:00 uur
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1b2441] border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Historie</CardTitle>
            <Button className="inline-flex items-center gap-1 rounded-half border px-2 py-0 text-xs font-semibold text-muted-foreground">
              Open Historie
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <LucidePillBottle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Paracetamol 500/50mg</div>
                    <div className="text-xs text-muted-foreground">3 Strips (10 p/strip) · 2 stuks</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">24-01-2026 · 14:00</div>
                  <div className="text-xs text-green-400">Op tijd</div>
                </div>
              </li>

              <li className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <LucidePillBottle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Paracetamol 500/50mg</div>
                    <div className="text-xs text-muted-foreground">1 Strip · 2 stuks</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">23-01-2026 · 20:00</div>
                  <div className="text-xs text-red-400">Gemist</div>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
