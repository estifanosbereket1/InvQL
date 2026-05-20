import { Product } from "@/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Package, TrendingUp, AlertTriangle, XCircle } from "lucide-react";

interface StatsBarProps {
  products: Product[];
}

export function StatsBar({ products }: StatsBarProps) {
  const totalProducts = products.length;
  const totalValue = products.reduce(
    (acc, p) => acc + Number(p.price) * p.quantity,
    0,
  );
  const lowStock = products.filter((p) => p.status === "low_stock").length;
  const outOfStock = products.filter((p) => p.status === "out_of_stock").length;

  const stats = [
    {
      label: "Total Products",
      value: totalProducts,
      icon: Package,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: "Inventory Value",
      value: `$${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      label: "Low Stock",
      value: lowStock,
      icon: AlertTriangle,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950",
    },
    {
      label: "Out of Stock",
      value: outOfStock,
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`p-2.5 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                {stat.label}
              </p>
              <p className="text-xl font-semibold tracking-tight">
                {stat.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
