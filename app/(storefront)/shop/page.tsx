import { Card } from "@/components/ui/card";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Shop Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse our catalog of new, pre-owned, and refurbished tech.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products by name, brand, or category..."
            className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Placeholder */}
      <Card className="mt-8 p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Product catalog coming soon. Check back for our full selection of products.
        </p>
      </Card>
    </div>
  );
}
