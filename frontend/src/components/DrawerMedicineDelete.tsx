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

type DrawerMedicineDeleteProps = {
  medicineName: string;
  onConfirm?: () => void;
};

export default function DrawerMedicineDelete({
  medicineName,
  onConfirm,
}: DrawerMedicineDeleteProps) {
  const [open, setOpen] = React.useState(false);

  const handleConfirm = () => {
    onConfirm?.();
    setOpen(false);
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
          <AlertDialogTitle className="text-white/80">Medicijn verwijderen?</AlertDialogTitle>
          <AlertDialogDescription className="text-white/50">
            Hiermee verwijder je <strong>{medicineName}</strong> permanent uit je
            lijst. Deze actie kan niet ongedaan worden gemaakt.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="main-button-nb">Annuleren</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={handleConfirm}
          >
            Verwijderen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
