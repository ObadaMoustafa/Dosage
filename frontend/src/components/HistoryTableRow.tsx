import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';

export type HistoryEntry = {
  id: string;
  medicine: string;
  details: string;
  scheduledAt: string;
  status: 'Op tijd' | 'Gemist';
};

type HistoryTableRowProps = {
  entry: HistoryEntry;
  onDelete?: (id: string) => Promise<void> | void;
};

export default function HistoryTableRow({
  entry,
  onDelete,
}: HistoryTableRowProps) {
  const statusLabel = entry.status ?? 'Op tijd';

  return (
    <TableRow>
      <TableCell className="font-medium">{entry.medicine}</TableCell>
      <TableCell className="text-muted-foreground">{entry.details}</TableCell>
      <TableCell>{entry.scheduledAt}</TableCell>
      <TableCell className="text-right">
        <span
          className={
            statusLabel === 'Op tijd'
              ? 'text-green-400 text-xs font-semibold'
              : 'text-red-400 text-xs font-semibold'
          }
        >
          {statusLabel}
        </span>
      </TableCell>
      <TableCell className="text-right">
        {onDelete ? (
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Trash2 className="h-4 w-4" />
              </Button>
            }
            title="Weet je het zeker?"
            description="Deze log wordt verwijderd en kan niet worden hersteld."
            confirmLabel="Verwijderen"
            onConfirm={() => onDelete(entry.id)}
          />
        ) : null}
      </TableCell>
    </TableRow>
  );
}
