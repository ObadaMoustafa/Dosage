export type StockStatus = "Op peil" | "Bijna op" | "Bijna leeg";

export type StockItem = {
  id: string;
  name: string;
  stripsCount: number;
  pillsPerStrip: number;
  loosePills: number;
  threshold: number;
  lastUpdated: string;
  status: StockStatus;
};

export const stockItems: StockItem[] = [];

export function getTotalPills(item: StockItem) {
  return item.stripsCount * item.pillsPerStrip + item.loosePills;
}

export function formatStockDetails(item: StockItem) {
  return `${item.stripsCount} strips · ${item.pillsPerStrip} p/strip · ${item.loosePills} los`;
}

export function formatStockLabel(item: StockItem) {
  return `${getTotalPills(item)} stuks · ${formatStockDetails(item)}`;
}
