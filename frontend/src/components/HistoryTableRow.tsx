import { TableCell, TableRow } from "@/components/ui/table";

export type HistoryEntry = {
  id: string;
  medicine: string;
  details: string;
  scheduledAt: string;
  status: "Op tijd" | "Gemist";
};

type HistoryTableRowProps = {
  entry: HistoryEntry;
};

export default function HistoryTableRow({ entry }: HistoryTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{entry.medicine}</TableCell>
      <TableCell className="text-muted-foreground">{entry.details}</TableCell>
      <TableCell>{entry.scheduledAt}</TableCell>
      <TableCell className="text-right">
        <span
          className={
            entry.status === "Op tijd"
              ? "text-green-400 text-xs font-semibold"
              : "text-red-400 text-xs font-semibold"
          }
        >
          {entry.status}
        </span>
      </TableCell>
    </TableRow>
  );
}
