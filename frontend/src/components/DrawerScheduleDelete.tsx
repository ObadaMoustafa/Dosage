import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';

type DrawerScheduleDeleteProps = {
  scheduleLabel: string;
  onConfirm?: () => void;
};

export default function DrawerScheduleDelete({
  scheduleLabel,
  onConfirm,
}: DrawerScheduleDeleteProps) {
  const [open, setOpen] = React.useState(false);

  const handleConfirm = () => {
    onConfirm?.();
    setOpen(false);
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Trash2 className="h-4 w-4" />
        </Button>
      }
      title="Schema verwijderen?"
      description={
        <>
          Hiermee verwijder je <strong>{scheduleLabel}</strong> permanent uit je
          schema&apos;s. Deze actie kan niet ongedaan worden gemaakt.
        </>
      }
      confirmLabel="Verwijderen"
      onConfirm={handleConfirm}
    />
  );
}
