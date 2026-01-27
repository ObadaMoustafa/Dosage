import * as React from "react";
import { Button } from "@/components/ui/button";
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
import { Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

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

  const handleConfirm = async () => {
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
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="dialog-main">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white/80">{medicineName} verwijderen?</AlertDialogTitle>
          <AlertDialogDescription className="text-white/50">
            Hiermee verwijder je <strong>{medicineName}</strong> permanent uit je
            lijst. Deze actie kan niet ongedaan worden gemaakt.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="main-button-nb" disabled={loading}>
            Annuleren
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? <Spinner className="h-4 w-4 text-white" /> : "Verwijderen"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
