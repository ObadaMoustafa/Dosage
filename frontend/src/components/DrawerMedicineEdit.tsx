import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, X } from 'lucide-react';

export type MedicineRow = {
  id?: string;
  name: string;
  brand: string;
  route: string;
  strength: string;
  description: string;
  leaflet: string;
  stockId?: string;
};

type DrawerMedicineEditProps = {
  medicine: MedicineRow;
  onSave?: (next: MedicineRow) => Promise<boolean> | boolean | void;
  stockOptions?: { id: string; label: string }[];
};

const routeOptions = ['Oraal', 'Anaal', 'Spuit', 'Anders'];

export default function DrawerMedicineEdit({
  medicine,
  onSave,
  stockOptions = [],
}: DrawerMedicineEditProps) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<MedicineRow>(medicine);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setForm(medicine);
    }
  }, [open, medicine]);

  const handleSave = async () => {
    if (!onSave) {
      setOpen(false);
      return;
    }

    setSaving(true);
    try {
      const result = await onSave(form);
      if (result === false) return;
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="dialog-main sm:left-1/2 sm:right-auto sm:w-lg sm:-translate-x-1/2">
        <div className="mx-auto w-full max-w-2xl pb-2">
          <div className="relative">
            <DrawerHeader className="dialog-text-color">
              <DrawerTitle className="text-white/90">
                Medicijn: {medicine.name}
              </DrawerTitle>
              <DrawerDescription className="text-white/50">
                Pas de gegevens van dit medicijn aan
              </DrawerDescription>
            </DrawerHeader>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3 h-8 w-8"
              >
                <X className="h-6 w-6 text-white/90" />
              </Button>
            </DrawerClose>
          </div>

          <div className="space-y-6 px-4 pb-4">
            <div className="space-y-4">
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
                <Label className="text-white/80">Merk</Label>
                <Input
                  value={form.brand}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, brand: event.target.value }))
                  }
                  className="bg-white/5 border-white/15 text-white/90"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-white/80">Toedieningsvorm</Label>
                <Select
                  value={form.route}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, route: value }))
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/15 text-white/90">
                    <SelectValue placeholder="Kies toedieningsvorm" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141c33] text-foreground border-white/15">
                    {routeOptions.map((option) => (
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

              {stockOptions.length > 0 && (
                <div className="grid gap-2">
                  <Label className="text-white/80">Voorraad koppelen</Label>
                  <Select
                    value={form.stockId ?? 'none'}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        stockId: value === 'none' ? undefined : value,
                      }))
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/15 text-white/90">
                      <SelectValue placeholder="Kies voorraad" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141c33] text-foreground border-white/15">
                      <SelectItem
                        value="none"
                        className="text-white/90 data-[highlighted]:bg-white/10 data-[highlighted]:text-white/90 data-[state=checked]:bg-white/10"
                      >
                        Geen koppeling
                      </SelectItem>
                      {stockOptions.map((option) => (
                        <SelectItem
                          key={option.id}
                          value={option.id}
                          className="text-white/90 data-[highlighted]:bg-white/10 data-[highlighted]:text-white/90 data-[state=checked]:bg-white/10"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label className="text-white/80">Sterkte</Label>
                <Input
                  value={form.strength}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      strength: event.target.value,
                    }))
                  }
                  className="bg-white/5 border-white/15 text-white/90"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-white/80">Beschrijving</Label>
                <Textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="bg-white/5 border-white/15 text-white/90"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-white/80">Bijsluiter</Label>
                <Textarea
                  value={form.leaflet}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      leaflet: event.target.value,
                    }))
                  }
                  className="bg-white/5 border-white/15 text-white/90"
                />
              </div>
            </div>
          </div>

          <DrawerFooter>
            <Button
              type="button"
              className="bg-white/10 text-white/90 hover:bg-white/20"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Opslaan...' : 'Opslaan'}
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
