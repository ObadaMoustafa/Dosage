import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import { LucideClock, LucidePillBottle, LucideTablets } from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {Link} from "react-router-dom";

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
      <CardFooter className="pt-3">
        <div className="grid w-full grid-cols-1 items-stretch gap-2 sm:grid-cols-3">
          <Button
            size="sm"
            className="h-10 w-full bg-green-500/15 text-green-200 hover:bg-green-500/25"
          >
            Ingenomen
          </Button>
          <Button
            size="sm"
            className="h-10 w-full bg-red-500/15 text-red-200 hover:bg-red-500/25"
          >
            Gemist
          </Button>
          <Button
            asChild
            className="inline-flex h-10 w-full items-center justify-center gap-1 rounded-half bg-[#141c33] text-xs text-muted-foreground hover:bg-[#1b2441]"
          >
            <Link to="/schedules">Ga naar Schema's</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
