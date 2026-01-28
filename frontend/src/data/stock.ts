export type StockStatus = "Op peil" | "Bijna op" | "Bijna leeg";

export type StockItem = {
  id: string;
  name: string;
  packsCount: number;
  pillsPerPack: number;
  loosePills: number;
  threshold: number;
  lastUpdated: string;
  status: StockStatus;
};

export const stockItems: StockItem[] = [];

export function getTotalPills(item: StockItem) {
  return item.packsCount * item.pillsPerPack + item.loosePills;
}

export function formatStockDetails(item: StockItem) {
  return `${item.packsCount} verpakkingen - ${item.pillsPerPack} p/verpakking - ${item.loosePills} los`;
}

export function formatStockLabel(item: StockItem) {
  return `${getTotalPills(item)} stuks - ${formatStockDetails(item)}`;
}
