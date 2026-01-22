import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import {Separator} from "@/components/ui/separator.tsx";
import DrawerMedicineEdit from "@/components/DrawerMedicineEdit";
import DrawerMedicineDelete from "@/components/DrawerMedicineDelete";
import DrawerMedicineCreate from "@/components/DrawerMedicineCreate";

const medicines = [
  {
    name: "Omeprazol",
    route: "Oraal",
    strength: "20mg",
    description: "Tegen maagzuur",
    leaflet: "Klik voor bijsluiter",
  },
  {
    name: "Paracetamol",
    route: "Oraal",
    strength: "500/50mg",
    description: "Generiek gebruik",
    leaflet: "Klik voor bijsluiter",
  },
];

export default function DashboardMedicines() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const filteredMedicines = medicines.filter((medicine) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      medicine.name.toLowerCase().includes(query) ||
      medicine.route.toLowerCase().includes(query) ||
      medicine.strength.toLowerCase().includes(query) ||
      medicine.description.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Medicijnen</h1>
        <p className="text-sm text-muted-foreground">
          Beheer je medicijnen en voeg nieuwe toe.
        </p>
      </div>
      <Separator className="my-6" />

      <Card className="bg-[#1b2441] border-border/60">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-base">Je medicijnen</CardTitle>
            <DrawerMedicineCreate />
          </div>
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 bg-background/10 border-border/60"
              placeholder="Zoeken door je medicijnen"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicijn</TableHead>
                <TableHead>Toedieningsvorm</TableHead>
                <TableHead>Sterkte</TableHead>
                <TableHead>Beschrijving</TableHead>
                <TableHead>Bijsluiter</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedicines.map((medicine) => (
                <TableRow key={medicine.name}>
                  <TableCell className="font-medium">
                    {medicine.name}
                  </TableCell>
                  <TableCell>{medicine.route}</TableCell>
                  <TableCell>{medicine.strength}</TableCell>
                  <TableCell>{medicine.description}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      className="text-xs text-white/80 underline-offset-4 hover:underline"
                    >
                      {medicine.leaflet}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <DrawerMedicineEdit medicine={medicine} />
                      <DrawerMedicineDelete medicineName={medicine.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="text-xs text-muted-foreground">
            {filteredMedicines.length} medicijnen
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
