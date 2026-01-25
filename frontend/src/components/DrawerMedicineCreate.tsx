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
import { formatStockLabel, stockItems } from "@/data/stock";

const routeOptions = ["Oraal", "Anaal", "Spuit", "Anders"];
const stockOptions = stockItems.map((item) => ({
  id: item.id,
  label: `${item.name} · ${formatStockLabel(item)}`,
}));

export default function DrawerMedicineCreate() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nieuw Medicijn Toevoegen
        </Button>
      </DrawerTrigger>
      <DrawerContent className="dialog-main sm:left-1/2 sm:right-auto sm:w-lg sm:-translate-x-1/2">
        <div className="mx-auto w-full max-w-2xl pb-2">
          <div className="relative">
            <DrawerHeader className="dialog-text-color">
              <DrawerTitle className="text-white/90">Nieuw Medicijn</DrawerTitle>
              <DrawerDescription className="text-white/50">
                Voeg medicijninformatie toe voor je overzicht.
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
                <Label className="text-white/80">Merk</Label>
                <Input
                  placeholder="Bijv. Kruidvat of apotheek"
                  className="bg-white/5 border-white/15 text-white/90"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-white/80">Toedieningsvorm</Label>
                <Select>
                  <SelectTrigger className="bg-white/5 border-white/15 text-white/90">
                    <SelectValue placeholder="Kies toedieningsvorm" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141c33] text-foreground border-white/15">
                    {routeOptions.map((option) => (
                      <SelectItem
                        key={option}
                        value={option.toLowerCase()}
                        className="text-white/90 data-[highlighted]:bg-white/10 data-[highlighted]:text-white/90 data-[state=checked]:bg-white/10"
                      >
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-white/80">Voorraad koppelen</Label>
                <Select>
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

              <div className="grid gap-2">
                <Label className="text-white/80">Sterkte</Label>
                <Input
                  placeholder="500 mg"
                  className="bg-white/5 border-white/15 text-white/90"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-white/80">Beschrijving</Label>
                <Textarea
                  placeholder="Geef een korte beschrijving..."
                  className="bg-white/5 border-white/15 text-white/90"
                />
              </div>

              <div className="grid gap-3">
                <Label className="text-white/80">Bijsluiter</Label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    id="fda-leaflet"
                    type="checkbox"
                    className="h-4 w-4 rounded border border-white/20 bg-white/10 text-primary accent-primary"
                  />
                  <Label htmlFor="fda-leaflet" className="text-sm font-normal">
                    Gebruik bijsluiter vanuit FDA API
                  </Label>
                </div>
                <Textarea
                  placeholder="Extra informatie over de bijsluiter..."
                  className="bg-white/5 border-white/15 text-white/90"
                />
              </div>
            </div>
          </div>

          <DrawerFooter>
            <Button className="bg-white/10 text-white/90 hover:bg-white/20">
              Toevoegen
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
