import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, LucidePillBottle, LucideTablets } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

type RemainingMedsCardProps = {
  title: string;
  deltaLabel: string;
  totalLabel: string;
  packLabel: string;
  nextDoseLabel: string;
};

export default function RemainingMedsCard({
  title,
  deltaLabel,
  totalLabel,
  packLabel,
  nextDoseLabel,
}: RemainingMedsCardProps) {
  return (
    <Card className="bg-[#1b2441] border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold text-muted-foreground">
          <ArrowDownRight className="h-3 w-3" />
          {deltaLabel}
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold mb-1">{totalLabel}</div>
        <p className="text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 py-0.5 text-xs font-semibold text-muted-foreground">
            <LucidePillBottle className="h-4 w-4 mr-0.5" />
            {packLabel}
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 py-0.5 mt-1 text-xs font-semibold text-muted-foreground">
            <LucideTablets className="h-4 w-4 mr-0.5" />
            {nextDoseLabel}
          </span>
        </p>
      </CardContent>
      <CardFooter className="pt-3 flex justify-end">
        <Button
          asChild
          className="inline-flex items-center gap-1 rounded-half border px-2 py-0 text-xs font-semibold text-muted-foreground"
        >
          <Link to="/dashboard/inventory">Ga naar voorraad</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
