import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export type HistoryLineChartPoint = {
  label: string;
  value: number;
  details?: {
    time: string;
    status: "Op tijd" | "Gemist";
    medicine: string;
  }[];
};

type HistoryLineChartProps = {
  title?: string;
  description?: string;
  trendLabel?: string;
  footerLabel?: string;
  data: HistoryLineChartPoint[];
  seriesLabel?: string;
  seriesColor?: string;
};

export default function HistoryLineChart({
  title = "Inname Historie",
  description = "Laatste 6 maanden",
  trendLabel = "Trending up by 5.2% this month",
  footerLabel = "Showing total intakes for the last 6 months",
  data,
  seriesLabel = "Innames",
  seriesColor = "#4963b3",
}: HistoryLineChartProps) {
  const chartData = data.map((point) => ({
    label: point.label,
    value: point.value,
    details: point.details ?? [],
  }));
  const chartConfig = {
    value: {
      label: seriesLabel,
      color: seriesColor,
    },
  } satisfies ChartConfig;

  return (
    <Card className="bg-[#1b2441] border-border/60">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-48 aspect-auto">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => value}
                  formatter={(_, __, item) => {
                    const details = item.payload.details as
                      | {
                          time: string;
                          status: "Op tijd" | "Gemist";
                          medicine: string;
                        }[]
                      | undefined;
                    if (!details?.length) {
                      return (
                        <div className="text-xs text-muted-foreground">
                          Geen innames geregistreerd.
                        </div>
                      );
                    }
                    return (
                      <div className="grid gap-1.5 text-xs">
                        {details.map((detail, index) => (
                          <div
                            key={`${detail.time}-${index}`}
                            className="flex items-center justify-between gap-3"
                          >
                            <div className="flex flex-col">
                              <span className="text-muted-foreground">
                                {detail.time}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {detail.medicine}
                              </span>
                            </div>
                            <span
                              className={
                                detail.status === "Op tijd"
                                  ? "text-green-400"
                                  : "text-red-400"
                              }
                            >
                              {detail.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
              }
            />
            <Line
              dataKey="value"
              type="natural"
              stroke="var(--color-value)"
              strokeWidth={2}
              strokeLinecap="round"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {trendLabel} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">{footerLabel}</div>
      </CardFooter>
    </Card>
  );
}
