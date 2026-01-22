import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucidePillBottle } from "lucide-react";

type HistoryItem = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  status: string;
  statusClassName: string;
};

type HistoryCardProps = {
  items: HistoryItem[];
};

export default function HistoryCard({ items }: HistoryCardProps) {
  return (
    <Card className="bg-[#1b2441] border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium">Historie</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <LucidePillBottle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.detail}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{item.timestamp}</div>
                <div className={item.statusClassName}>{item.status}</div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-3 flex justify-end">
        <Button className="inline-flex items-center gap-1 rounded-half border px-2 py-0 text-xs font-semibold text-muted-foreground">
          Ga naar Historie
        </Button>
      </CardFooter>
    </Card>
  );
}
