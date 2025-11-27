// Contexto: Stock - Entidades relacionadas ao estoque
export class StockItem {
  id: string;
  name: string;
  category: 'food' | 'medicine' | 'equipment';
  quantity: number;
  minStock: number;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}