import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import { LucideClock, LucidePillBottle, LucideTablets } from "lucide-react";
import {Button} from "@/components/ui/button.tsx";

type UpcomingDoseCardProps = {
  timeLabel: string;
  medicineLabel: string;
  quantityLabel: string;
  etaLabel: string;
};

export default function UpcomingDoseCard({
  timeLabel,
  medicineLabel,
  quantityLabel,
  etaLabel,
}: UpcomingDoseCardProps) {
  return (
    <Card className="bg-[#1b2441] border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium">Aankomende Inname</CardTitle>
        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold text-muted-foreground">
          <LucideClock className="h-3 w-3" />
          {etaLabel}
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold mb-1">{timeLabel}</div>
        <p className="text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 py-0.5 text-xs font-semibold text-muted-foreground">
            <LucidePillBottle className="h-4 w-4 mr-0.5" />
            {medicineLabel}
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 py-0.5 mt-1 text-xs font-semibold text-muted-foreground">
            <LucideTablets className="h-4 w-4 mr-0.5" />
            {quantityLabel}
          </span>
        </p>
      </CardContent>
      <CardFooter className="pt-3 flex justify-end">
        <Button className="inline-flex items-center gap-1 rounded-half border px-2 py-0 text-xs font-semibold text-muted-foreground">
          Ga naar Schema's
        </Button>
      </CardFooter>
    </Card>
  );
}
