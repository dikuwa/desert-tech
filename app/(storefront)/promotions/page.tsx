import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PromotionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Promotions & Special Offers</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Check out our latest deals and promotions.
      </p>

      <Card className="mt-8 p-12 text-center">
        <Sparkles className="mx-auto h-12 w-12 text-primary" />
        <h2 className="mt-4 text-lg font-semibold text-foreground">No Active Promotions</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Check back soon for new deals and special offers.
        </p>
        <Link href="/shop" className="mt-6 inline-block">
          <Button>Browse Products</Button>
        </Link>
      </Card>
    </div>
  );
}
