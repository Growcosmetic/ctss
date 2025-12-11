// ============================================
// Inventory Types
// ============================================

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: "chemical" | "retail" | "treatment" | null;
  unit: string; // Đơn vị đếm (Ống, Chai, Túi, Cái, etc.)
  capacity?: number | null; // Dung tích/số lượng (15, 100, etc.)
  capacityUnit?: string | null; // Đơn vị dung tích (ml, l, g, kg, etc.)
  defaultUsage?: number | null;
  branchAware: boolean;
  cost: number;
  price: number;
  isActive: boolean;
}

export interface ProductStock {
  id: string;
  productId: string;
  branchId: string;
  locationId?: string | null;
  quantity: number;
  minLevel?: number | null;
  maxLevel?: number | null;
  product?: Product;
  branch?: {
    id: string;
    name: string;
  };
  location?: {
    id: string;
    code: string;
    zone?: string | null;
    rack?: string | null;
    shelf?: string | null;
    bin?: string | null;
  } | null;
}

export interface StockTransaction {
  id: string;
  productId: string;
  branchId: string;
  type: "IN" | "OUT" | "ADJUST" | "TRANSFER";
  quantity: number;
  reason?: string | null;
  reference?: string | null;
  notes?: string | null;
  createdBy: string;
  createdAt: Date;
  product?: Product;
  branch?: {
    id: string;
    name: string;
  };
}

export interface ServiceProductUsage {
  id: string;
  serviceId: string;
  productId: string;
  amountUsed: number;
  unit: string;
  service?: {
    id: string;
    name: string;
  };
  product?: Product;
}

export interface LowStockAlert {
  productId: string;
  productName: string;
  branchId: string;
  branchName: string;
  currentStock: number;
  minLevel: number;
  daysUntilOut: number;
  severity: "CRITICAL" | "WARNING" | "LOW";
}

export interface UsageTrend {
  productId: string;
  productName: string;
  branchId: string;
  period: string;
  totalUsed: number;
  averagePerService: number;
  trend: number; // percentage change
  forecastNext30Days: number;
}

export interface InventoryForecast {
  productId: string;
  productName: string;
  branchId: string;
  currentStock: number;
  dailyUsage: number;
  daysUntilOut: number;
  recommendedReorder: number;
  confidence: number; // 0-1
}

