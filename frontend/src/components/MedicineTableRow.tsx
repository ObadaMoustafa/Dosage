import { TableCell, TableRow } from "@/components/ui/table";
import DrawerMedicineEdit, { type MedicineRow } from "@/components/DrawerMedicineEdit";
import DrawerMedicineDelete from "@/components/DrawerMedicineDelete";
import { formatStockLabel, type StockItem } from "@/data/stock";

type MedicineTableRowProps = {
  medicine: MedicineRow;
  stockById: Map<string, StockItem>;
};

export default function MedicineTableRow({
  medicine,
  stockById,
}: MedicineTableRowProps) {
  const stockItem = medicine.stockId ? stockById.get(medicine.stockId) : undefined;
  const stockLabel = medicine.stockId
    ? stockItem
      ? formatStockLabel(stockItem)
      : "Onbekend"
    : "Niet gekoppeld";

  return (
    <TableRow>
      <TableCell className="font-medium">{medicine.name}</TableCell>
      <TableCell className="text-muted-foreground">{medicine.brand}</TableCell>
      <TableCell>{medicine.route}</TableCell>
      <TableCell>{medicine.strength}</TableCell>
      <TableCell>{medicine.description}</TableCell>
      <TableCell className="text-muted-foreground">{stockLabel}</TableCell>
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
  );
}
