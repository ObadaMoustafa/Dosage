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
  isReadOnly?: boolean;
};

export default function HistoryTableRow({
  entry,
  onDelete,
  isReadOnly,
}: HistoryTableRowProps) {
  const statusLabel = entry.status ?? 'Op tijd';

  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="p-3 font-medium">{entry.medicine}</td>
      <td className="p-3 text-muted-foreground">{entry.details}</td>
      <td className="p-3">{entry.scheduledAt}</td>
      <td className="p-3 text-right">
        <span
          className={
            statusLabel === 'Op tijd'
              ? 'text-green-400 text-xs font-semibold'
              : 'text-red-400 text-xs font-semibold'
          }
        >
          {statusLabel}
        </span>
      </td>
      {!isReadOnly && (
        <td className="p-3 text-right">
          {onDelete ? (
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
              title="Weet je het zeker?"
              description="Deze log wordt verwijderd en kan niet worden hersteld."
              confirmLabel="Verwijderen"
              onConfirm={() => onDelete(entry.id)}
            />
          ) : null}
        </td>
      )}
    </tr>
  );
}
