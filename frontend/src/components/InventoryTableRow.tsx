import { TableCell, TableRow } from "@/components/ui/table";
import DrawerStockEdit from "@/components/DrawerStockEdit";
import { formatStockDetails, getTotalPills, type StockItem } from "@/data/stock";

type InventoryTableRowProps = {
  item: StockItem;
};

export default function InventoryTableRow({ item }: InventoryTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell>
        <div className="text-sm font-semibold">{getTotalPills(item)} stuks</div>
        <div className="text-xs text-muted-foreground">
          {formatStockDetails(item)}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {item.threshold} stuks
      </TableCell>
      <TableCell>{item.lastUpdated}</TableCell>
      <TableCell className="text-right">
        <span
          className={
            item.status === "Op peil"
              ? "text-green-400 text-xs font-semibold"
              : item.status === "Bijna op"
                ? "text-amber-400 text-xs font-semibold"
                : "text-red-400 text-xs font-semibold"
          }
        >
          {item.status}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <DrawerStockEdit stock={item} />
        </div>
      </TableCell>
    </TableRow>
  );
}
