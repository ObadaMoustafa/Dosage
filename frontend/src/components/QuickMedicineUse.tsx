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
import { logsApi, medicinesApi } from "@/lib/api";
import { toast } from "sonner";

type MedicineOption = {
  id: string;
  label: string;
  value: string;
};

export default function QuickMedicineUse() {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [medicineItems, setMedicineItems] = React.useState<MedicineOption[]>([]);
  const [doseCount, setDoseCount] = React.useState(1);
  const [selectedMedicine, setSelectedMedicine] = React.useState<MedicineOption | null>(
    null,
  );
  const [medicineQuery, setMedicineQuery] = React.useState("");

  const loadMedicines = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await medicinesApi.listMy();
      const options = data.map((item) => ({
        id: item.id,
        label: item.medicijn_naam,
        value: item.id,
      }));
      setMedicineItems(options);
    } catch (error) {
      toast.error((error as Error).message || "Medicijnen laden mislukt.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadMedicines();
    const handleMedicinesUpdate = () => {
      void loadMedicines();
    };
    window.addEventListener("turfje:medicines-updated", handleMedicinesUpdate);
    return () => {
      window.removeEventListener("turfje:medicines-updated", handleMedicinesUpdate);
    };
  }, [loadMedicines]);

  const filteredMedicineItems = medicineItems.filter((item) =>
    item.label.toLowerCase().includes(medicineQuery.trim().toLowerCase()),
  );

  const handleSubmit = async (status: "optijd" | "gemist") => {
    if (!selectedMedicine) {
      toast.error("Selecteer een medicijn.");
      return;
    }

    setSubmitting(true);
    try {
      await logsApi.create({
        gmn_id: selectedMedicine.id,
        medicijn_turven: doseCount,
        status,
      });
      toast.success(status === "gemist" ? "Gemiste inname opgeslagen." : "Inname opgeslagen.");
      window.dispatchEvent(new CustomEvent("turfje:log-created"));
      setOpen(false);
      setDoseCount(1);
      setSelectedMedicine(null);
      setMedicineQuery("");
    } catch (error) {
      toast.error((error as Error).message || "Inname opslaan mislukt.");
    } finally {
      setSubmitting(false);
    }
  };

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
                  placeholder={loading ? "Medicijnen laden..." : "Selecteer een medicijn"}
                  disabled={loading}
                />
                <ComboboxContent className="dialog-main-select-content z-[60] pointer-events-auto">
                  <ComboboxList>
                    <ComboboxGroup>
                      {filteredMedicineItems.map((item) => (
                        <ComboboxItem
                          key={item.value}
                          value={item}
                          onMouseDown={() => {
                            setSelectedMedicine(item);
                            setMedicineQuery(item.label);
                          }}
                        >
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
                  disabled={submitting}
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
                  disabled={submitting}
                >
                  +
                </Button>
              </div>
            </div>
          </div>
          <DrawerFooter className="pt-2 mt-2">
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                type="button"
                className="h-10 w-full bg-green-500/15 text-green-200 hover:bg-green-500/25"
                onClick={() => handleSubmit("optijd")}
                disabled={submitting || loading}
              >
                {submitting ? "Bezig..." : "Ingenomen"}
              </Button>
              <Button
                type="button"
                className="h-10 w-full bg-red-500/15 text-red-200 hover:bg-red-500/25"
                onClick={() => handleSubmit("gemist")}
                disabled={submitting || loading}
              >
                {submitting ? "Bezig..." : "Gemist"}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
