import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { AlertTriangle, CheckCircle, Package, DollarSign } from 'lucide-react';

interface TyreInventoryStatsProps {
  inventory: Array<{
    quantity: number;
    minStock: number;
    cost: number;
  }>;
}

export const TyreInventoryStats: React.FC<TyreInventoryStatsProps> = ({ inventory }) => {
  const totalStock = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = inventory.filter(item => item.quantity <= item.minStock).length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
  const averageCost = totalStock > 0 ? totalValue / totalStock : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Package className="w-4 h-4 mr-2" />
            Total Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStock}</div>
          <p className="text-xs text-muted-foreground">Total tyres in inventory</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Low Stock Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{lowStockCount}</div>
          <p className="text-xs text-muted-foreground">Items below minimum stock level</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Total Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R {totalValue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Total inventory value</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Average Cost
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R {averageCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          <p className="text-xs text-muted-foreground">Average cost per tyre</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TyreInventoryStats;
