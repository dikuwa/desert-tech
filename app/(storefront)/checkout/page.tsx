import { Card } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Checkout</h1>

      <Card className="mt-8 p-12 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold text-foreground">No items to checkout</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Add products to your cart before checking out.
        </p>
        <Link href="/shop" className="mt-6 inline-block">
          <Button>Browse Products</Button>
        </Link>
      </Card>
    </div>
  );
}
