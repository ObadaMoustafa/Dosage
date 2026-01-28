import { TableCell, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export type HistoryEntry = {
  id: string;
  medicine: string;
  details: string;
  scheduledAt: string;
  status: "Op tijd" | "Gemist";
};

type HistoryTableRowProps = {
  entry: HistoryEntry;
  onDelete?: (id: string) => Promise<void> | void;
};

export default function HistoryTableRow({ entry, onDelete }: HistoryTableRowProps) {
  const statusLabel = entry.status ?? "Op tijd";

  return (
    <TableRow>
      <TableCell className="font-medium">{entry.medicine}</TableCell>
      <TableCell className="text-muted-foreground">{entry.details}</TableCell>
      <TableCell>{entry.scheduledAt}</TableCell>
      <TableCell className="text-right">
        <span
          className={
            statusLabel === "Op tijd"
              ? "text-green-400 text-xs font-semibold"
              : "text-red-400 text-xs font-semibold"
          }
        >
          {statusLabel}
        </span>
      </TableCell>
      <TableCell className="text-right">
        {onDelete ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#1b2441] border-border/60">
              <AlertDialogHeader>
                <AlertDialogTitle>Weet je het zeker?</AlertDialogTitle>
                <AlertDialogDescription>
                  Deze log wordt verwijderd en kan niet worden hersteld.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuleren</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(entry.id)}>
                  Verwijderen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </TableCell>
    </TableRow>
  );
}
