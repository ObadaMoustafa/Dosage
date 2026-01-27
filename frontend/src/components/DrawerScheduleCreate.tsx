import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import type { ScheduleRow } from "@/components/ScheduleTableRow";

type ScheduleCreatePayload = {
  gmnId: string;
  count: number;
  description: string;
  days: string[];
  times: string[];
};
const dayOptions = [
  "Maandag",
  "Dinsdag",
  "Woensdag",
  "Donderdag",
  "Vrijdag",
  "Zaterdag",
  "Zondag",
];

type DrawerScheduleCreateProps = {
  onSubmit?: (payload: ScheduleCreatePayload) => Promise<boolean> | boolean | void;
  medicineOptions?: { id: string; label: string }[];
};

export default function DrawerScheduleCreate({
  onSubmit,
  medicineOptions = [],
}: DrawerScheduleCreateProps) {
  const [times, setTimes] = React.useState(["09:00"]);
  const [selectedDays, setSelectedDays] = React.useState<string[]>([]);
  const [selectedMedicine, setSelectedMedicine] = React.useState<string>("");
  const [count, setCount] = React.useState(1);
  const [description, setDescription] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day],
    );
  };

  const updateTime = (index: number, value: string) => {
    setTimes((prev) => prev.map((time, i) => (i === index ? value : time)));
  };

  const addTime = () => setTimes((prev) => [...prev, "12:00"]);
  const removeTime = (index: number) =>
    setTimes((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!onSubmit) {
      setOpen(false);
      return;
    }
    if (!selectedMedicine) {
      return;
    }

    setSaving(true);
    try {
      const result = await onSubmit({
        gmnId: selectedMedicine,
        count,
        description,
        days: selectedDays,
        times,
      });
      if (result === false) return;
      setOpen(false);
      setTimes(["09:00"]);
      setSelectedDays([]);
      setSelectedMedicine("");
      setCount(1);
      setDescription("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nieuw Schema Toevoegen
        </Button>
      </DrawerTrigger>
      <DrawerContent className="dialog-main sm:left-1/2 sm:right-auto sm:w-lg sm:-translate-x-1/2">
        <div className="mx-auto w-full max-w-2xl pb-2">
          <div className="relative">
            <DrawerHeader className="dialog-text-color">
              <DrawerTitle className="text-white/90">Nieuw Schema</DrawerTitle>
              <DrawerDescription className="text-white/50">
                Stel een nieuw medicijnschema samen
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
            <div className="grid gap-2">
              <Label className="text-white/80">Medicijn</Label>
              <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                <SelectTrigger className="bg-white/5 border-white/15 text-white/90">
                  <SelectValue placeholder="Selecteer medicijn" />
                </SelectTrigger>
                <SelectContent className="bg-[#141c33] text-foreground border-white/15">
                  {medicineOptions.map((option) => (
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

            <div className="grid gap-2">
              <Label className="text-white/80">Aantal</Label>
              <Select value={`${count}x`} onValueChange={(value) => setCount(Number(value.replace("x", "")))}>
                <SelectTrigger className="bg-white/5 border-white/15 text-white/90">
                  <SelectValue placeholder="Kies aantal" />
                </SelectTrigger>
                <SelectContent className="bg-[#141c33] text-foreground border-white/15">
                  <SelectItem
                    value="1x"
                    className="text-white/90 data-[highlighted]:bg-white/10 data-[highlighted]:text-white/90 data-[state=checked]:bg-white/10"
                  >
                    1x
                  </SelectItem>
                  <SelectItem
                    value="2x"
                    className="text-white/90 data-[highlighted]:bg-white/10 data-[highlighted]:text-white/90 data-[state=checked]:bg-white/10"
                  >
                    2x
                  </SelectItem>
                  <SelectItem
                    value="3x"
                    className="text-white/90 data-[highlighted]:bg-white/10 data-[highlighted]:text-white/90 data-[state=checked]:bg-white/10"
                  >
                    3x
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-white/80">Beschrijving</Label>
              <Textarea
                placeholder="Bijv. Na het ontbijt innemen"
                className="bg-white/5 border-white/15 text-white/90"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-white/80">Welke dagen?</Label>
              <div className="flex flex-wrap gap-2">
                {dayOptions.map((day) => (
                  <Button
                    key={day}
                    type="button"
                    variant={selectedDays.includes(day) ? "secondary" : "outline"}
                    className={
                      selectedDays.includes(day)
                        ? "bg-white/30 border border-white/50 text-white/90 hover:bg-white/35 hover:text-white/90"
                        : "bg-white/5 border border-white/15 text-white/90 hover:bg-white/15 hover:text-white/90"
                    }
                    onClick={() => toggleDay(day)}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-white/80">Hoe laat?</Label>
              <div className="grid gap-2">
                {times.map((time, index) => (
                  <div key={`${time}-${index}`} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={time}
                      onChange={(event) => updateTime(index, event.target.value)}
                      className="bg-white/5 border-white/15 text-white/90"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="bg-white/5 border-white/15 text-white/90 hover:border-white/90 hover:bg-white/15"
                      onClick={() => removeTime(index)}
                      disabled={times.length === 1}
                    >
                      -
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="bg-white/5 border-white/15 text-white/90 hover:border-white/90 hover:bg-white/15"
                      onClick={addTime}
                    >
                      +
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DrawerFooter>
            <Button
              className="bg-white/10 text-white/90 hover:bg-white/20"
              type="button"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Opslaan..." : "Toevoegen"}
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
