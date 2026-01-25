import * as React from 'react';
import { Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { StockItem, StockStatus } from '@/data/stock';

type DrawerStockEditProps = {
  stock: StockItem;
  onSave?: (next: StockItem) => void;
};

const statusOptions: StockStatus[] = ['Op peil', 'Bijna op', 'Bijna leeg'];

export default function DrawerStockEdit({ stock, onSave }: DrawerStockEditProps) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<StockItem>(stock);

  React.useEffect(() => {
    if (open) {
      setForm(stock);
    }
  }, [open, stock]);

  const handleSave = () => {
    onSave?.(form);
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="dialog-main sm:left-1/2 sm:right-auto sm:w-lg sm:-translate-x-1/2">
        <div className="mx-auto w-full max-w-2xl pb-2">
          <div className="relative">
            <DrawerHeader className="dialog-text-color">
              <DrawerTitle className="text-white/90">
                Voorraad: {stock.name}
              </DrawerTitle>
              <DrawerDescription className="text-white/50">
                Werk de voorraadwaarden bij voor dit medicijn.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="absolute right-3 top-3 h-8 w-8">
                <X className="h-6 w-6 text-white/90" />
              </Button>
            </DrawerClose>
          </div>

          <div className="space-y-6 px-4 pb-4">
            <div className="grid gap-2">
              <Label className="text-white/80">Medicijn</Label>
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="bg-white/5 border-white/15 text-white/90"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-white/80">Aantal strips</Label>
              <Input
                type="number"
                min={0}
                value={form.stripsCount}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    stripsCount: Number(event.target.value),
                  }))
                }
                className="bg-white/5 border-white/15 text-white/90"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-white/80">Pillen per strip</Label>
              <Input
                type="number"
                min={1}
                value={form.pillsPerStrip}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    pillsPerStrip: Number(event.target.value),
                  }))
                }
                className="bg-white/5 border-white/15 text-white/90"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-white/80">Drempel (stuks)</Label>
              <Input
                type="number"
                min={0}
                value={form.threshold}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    threshold: Number(event.target.value),
                  }))
                }
                className="bg-white/5 border-white/15 text-white/90"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-white/80">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, status: value as StockStatus }))
                }
              >
                <SelectTrigger className="bg-white/5 border-white/15 text-white/90">
                  <SelectValue placeholder="Kies status" />
                </SelectTrigger>
                <SelectContent className="bg-[#141c33] text-foreground border-white/15">
                  {statusOptions.map((option) => (
                    <SelectItem
                      key={option}
                      value={option}
                      className="text-white/90 data-[highlighted]:bg-white/10 data-[highlighted]:text-white/90 data-[state=checked]:bg-white/10"
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DrawerFooter>
            <Button
              type="button"
              className="bg-white/10 text-white/90 hover:bg-white/20"
              onClick={handleSave}
            >
              Opslaan
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="main-button-nb">
                Annuleren
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
