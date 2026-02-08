import DrawerMedicineEdit, {
  type MedicineRow,
} from '@/components/DrawerMedicineEdit';
import DrawerMedicineDelete from '@/components/DrawerMedicineDelete';
import { formatStockLabel, type StockItem } from '@/data/stock';

type MedicineTableRowProps = {
  medicine: MedicineRow;
  stockById: Map<string, StockItem>;
  onEdit?: (medicine: MedicineRow) => void;
  onDelete?: () => void;
  stockOptions?: { id: string; label: string }[];
  isReadOnly?: boolean;
};

export default function MedicineTableRow({
  medicine,
  stockById,
  onEdit,
  onDelete,
  stockOptions = [],
  isReadOnly,
}: MedicineTableRowProps) {
  const stockItem = medicine.stockId
    ? stockById.get(medicine.stockId)
    : undefined;
  const stockLabel = medicine.stockId
    ? stockItem
      ? formatStockLabel(stockItem)
      : 'Onbekend'
    : 'Niet gekoppeld';
  // const brandLabel = medicine.brand?.trim() ? medicine.brand : "—";
  const leafletLabel = medicine.leaflet?.trim() ? medicine.leaflet : '—';

  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="p-3 font-medium">{medicine.name}</td>
      {/*<td className="p-3 text-muted-foreground">{brandLabel}</td>*/}
      <td className="p-3">{medicine.route}</td>
      <td className="p-3">{medicine.strength}</td>
      <td className="p-3">{medicine.description}</td>
      <td className="p-3 text-muted-foreground">{stockLabel}</td>
      <td className="p-3">{leafletLabel}</td>
      {!isReadOnly && (
        <td className="p-3 text-right">
          {!isReadOnly && (
            <div className="flex items-center justify-end gap-2">
              <DrawerMedicineEdit
                medicine={medicine}
                onSave={onEdit}
                stockOptions={stockOptions}
              />
              <DrawerMedicineDelete
                medicineName={medicine.name}
                onConfirm={onDelete}
              />
            </div>
          )}
        </td>
      )}
    </tr>
  );
}
