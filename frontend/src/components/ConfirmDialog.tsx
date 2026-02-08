import * as React from 'react';
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
} from '@/components/ui/alert-dialog';

type ConfirmDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title: string;
  description: React.ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  onConfirm: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  variant?: 'destructive' | 'default';
  loading?: boolean;
};

export default function ConfirmDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  cancelLabel = 'Annuleren',
  confirmLabel = 'Bevestigen',
  onConfirm,
  variant = 'destructive',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent className="bg-[#1b2441] border-white/10">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white/90">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-white/70">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={loading}
            className="bg-transparent text-white hover:bg-white/10 border-white/20"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className={
              variant === 'destructive'
                ? 'bg-red-900 text-red-100 hover:bg-red-950 border border-red-800'
                : 'bg-green-900 text-green-100 hover:bg-green-950 border border-green-800'
            }
          >
            {loading ? 'Bezig...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
