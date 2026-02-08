import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';

type DrawerMedicineDeleteProps = {
  medicineName: string;
  onConfirm?: () => Promise<boolean> | boolean | void;
};

export default function DrawerMedicineDelete({
  medicineName,
  onConfirm,
}: DrawerMedicineDeleteProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault(); // Keep dialog open while loading
    if (!onConfirm) {
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const result = await onConfirm();
      if (result === false) return;
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      }
      title={`${medicineName} verwijderen?`}
      description={
        <>
          Hiermee verwijder je <strong>{medicineName}</strong> permanent uit je
          lijst. Deze actie kan niet ongedaan worden gemaakt.
        </>
      }
      confirmLabel="Verwijderen"
      onConfirm={handleConfirm}
      loading={loading}
    />
  );
}
