import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Plus, X } from "lucide-react";

const medicineItems = [
  { label: "Paracetamol 500/50mg", value: "paracetamol-500-50" },
  { label: "Ibuprofen 250mg", value: "ibuprofen-250" },
  { label: "Omeprazol 20mg", value: "omeprazol-20" },
];

export default function QuickMedicineUse() {
  const [open, setOpen] = React.useState(false);
  const [doseCount, setDoseCount] = React.useState(1);
  const [selectedMedicine, setSelectedMedicine] = React.useState<
    (typeof medicineItems)[number] | null
  >(null);
  const [medicineQuery, setMedicineQuery] = React.useState("");
  const filteredMedicineItems = medicineItems.filter((item) =>
    item.label.toLowerCase().includes(medicineQuery.trim().toLowerCase()),
  );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="sm" className="h-8 gap-2">
          <Plus className="h-4 w-4" />
          Snel turven
        </Button>
      </DrawerTrigger>
      <DrawerContent className="dialog-main sm:left-1/2 sm:right-auto sm:w-[560px] sm:-translate-x-1/2">
        <div className="w-full pb-2">
          <div className="relative">
            <DrawerHeader className="text-left">
              <DrawerTitle className="text-white/90">Snelle Turf</DrawerTitle>
              <DrawerDescription>
                Voer hieronder in welk medicijn je hebt ingenomen
              </DrawerDescription>
            </DrawerHeader>
            <DrawerClose asChild>
              <Button
                size="icon"
                className="absolute right-3 top-3 h-8 w-8 nobg"
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
          <div className="grid gap-4 px-4">
            <div className="grid gap-2">
              <Label className="text-white/90">Medicijn</Label>
              <Combobox
                items={filteredMedicineItems}
                autoHighlight
                itemToStringLabel={(item) => item.label}
                itemToStringValue={(item) => item.value}
                value={selectedMedicine}
                onValueChange={(value) => {
                  setSelectedMedicine(value);
                  setMedicineQuery(value?.label ?? "");
                }}
                inputValue={medicineQuery}
                onInputValueChange={setMedicineQuery}
              >
                <ComboboxInput
                  className="bg-white/5 border-white/15 text-white/90"
                  placeholder="Selecteer een medicijn"
                />
                <ComboboxContent className="dialog-main-select-content">
                  <ComboboxList>
                    <ComboboxGroup>
                      {filteredMedicineItems.map((item) => (
                        <ComboboxItem key={item.value} value={item}>
                          {item.label}
                        </ComboboxItem>
                      ))}
                    </ComboboxGroup>
                    <ComboboxEmpty>Geen resultaten</ComboboxEmpty>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
            <div className="grid gap-2">
              <Label className="text-white/90">Aantal</Label>
              <div className="inline-flex items-center gap-2">
                <Button
                  className="bg-white/5 border-white/15 text-white/90 hover:border-white/90 hover:bg-white/15"
                  type="button"
                  size="icon"
                  onClick={() => setDoseCount(Math.max(1, doseCount - 1))}
                >
                  -
                </Button>
                <span className="min-w-8 text-center text-sm font-medium text-white/90">
                  {doseCount}
                </span>
                <Button
                  className="bg-white/5 border-white/15 text-white/90 hover:border-white/90 hover:bg-white/15"
                  type="button"
                  size="icon"
                  onClick={() => setDoseCount(doseCount + 1)}
                >
                  +
                </Button>
              </div>
            </div>
          </div>
          <DrawerFooter className="pt-2 mt-2">
            <DrawerClose asChild>
              <Button type="button" className="main-button">
                Invoegen
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
