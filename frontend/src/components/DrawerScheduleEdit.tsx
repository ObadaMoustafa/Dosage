import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

type DrawerScheduleEditProps = {
  schedule: import('@/components/ScheduleTableRow').ScheduleRow;
  onSave?: (
    next: import('@/components/ScheduleTableRow').ScheduleRow,
  ) => Promise<boolean> | boolean | void;
};

const countOptions = ['1x', '2x', '3x'];
const dayOptions = [
  'Maandag',
  'Dinsdag',
  'Woensdag',
  'Donderdag',
  'Vrijdag',
  'Zaterdag',
  'Zondag',
];

export default function DrawerScheduleEdit({
  schedule,
  onSave,
}: DrawerScheduleEditProps) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(schedule);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setForm(schedule);
    }
  }, [open, schedule]);

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

  const toggleDay = (day: string) => {
    setForm((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((item) => item !== day)
        : [...prev.days, day],
    }));
  };

  const updateTime = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      times: prev.times.map((time, i) => (i === index ? value : time)),
    }));
  };

  const addTime = () =>
    setForm((prev) => ({ ...prev, times: [...prev.times, '12:00'] }));

  const removeTime = (index: number) =>
    setForm((prev) => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index),
    }));

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
                Schema bewerken
              </DrawerTitle>
              <DrawerDescription className="text-white/50">
                Pas het schema aan voor dit medicijn
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
              <Input
                value={form.medicine}
                disabled
                className="bg-white/5 border-white/15 text-white/50 cursor-not-allowed"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-white/80">Aantal</Label>
              <Select
                value={`${form.count}x`}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    count: Number(value.replace('x', '')),
                  }))
                }
              >
                <SelectTrigger className="bg-white/5 border-white/15 text-white/90">
                  <SelectValue placeholder="Kies aantal" />
                </SelectTrigger>
                <SelectContent className="bg-[#141c33] text-foreground border-white/15">
                  {countOptions.map((option) => (
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

            <div className="grid gap-2">
              <Label className="text-white/80">Beschrijving</Label>
              <Input
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
              <Label className="text-white/80">Welke dagen?</Label>
              <div className="flex flex-wrap gap-2">
                {dayOptions.map((day) => (
                  <Button
                    key={day}
                    type="button"
                    variant={form.days.includes(day) ? 'secondary' : 'outline'}
                    className={
                      form.days.includes(day)
                        ? 'bg-white/30 border border-white/50 text-white/90 hover:bg-white/35 hover:text-white/90'
                        : 'bg-white/5 border border-white/15 text-white/90 hover:bg-white/15 hover:text-white/90'
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
                {form.times.map((time, index) => (
                  <div
                    key={`${time}-${index}`}
                    className="flex items-center gap-2"
                  >
                    <Input
                      type="time"
                      value={time}
                      onChange={(event) =>
                        updateTime(index, event.target.value)
                      }
                      className="bg-white/5 border-white/15 text-white/90"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="bg-white/5 border-white/15 text-white/90 hover:border-white/90 hover:bg-white/15"
                      onClick={() => removeTime(index)}
                      disabled={form.times.length === 1}
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
