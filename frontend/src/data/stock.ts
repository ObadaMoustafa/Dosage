export type StockStatus = 'Op peil' | 'Bijna op' | 'Bijna leeg';

export type StockItem = {
  id: string;
  name: string;
  stripsCount: number;
  pillsPerStrip: number;
  threshold: number;
  lastUpdated: string;
  status: StockStatus;
};

export const stockItems: StockItem[] = [
  {
    id: 'stock-1',
    name: 'Paracetamol 500/50mg',
    stripsCount: 3,
    pillsPerStrip: 10,
    threshold: 10,
    lastUpdated: '24-01-2026 · 09:15',
    status: 'Op peil',
  },
  {
    id: 'stock-2',
    name: 'Omeprazol 20mg',
    stripsCount: 1,
    pillsPerStrip: 8,
    threshold: 12,
    lastUpdated: '23-01-2026 · 20:00',
    status: 'Bijna op',
  },
  {
    id: 'stock-3',
    name: 'Ibuprofen 250mg',
    stripsCount: 1,
    pillsPerStrip: 4,
    threshold: 8,
    lastUpdated: '22-01-2026 · 19:00',
    status: 'Bijna leeg',
  },
  {
    id: 'stock-4',
    name: 'Vitamine D 25mcg',
    stripsCount: 2,
    pillsPerStrip: 8,
    threshold: 10,
    lastUpdated: '22-01-2026 · 08:00',
    status: 'Op peil',
  },
];

export function getTotalPills(item: StockItem) {
  return item.stripsCount * item.pillsPerStrip;
}

export function formatStockDetails(item: StockItem) {
  return `${item.stripsCount} strips · ${item.pillsPerStrip} p/strip`;
}

export function formatStockLabel(item: StockItem) {
  return `${getTotalPills(item)} stuks · ${formatStockDetails(item)}`;
}
