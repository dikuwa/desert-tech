import { Card } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Shopping Cart</h1>

      <Card className="mt-8 p-12 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold text-foreground">Your cart is empty</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Add products to your cart and they will appear here.
        </p>
        <Link href="/shop" className="mt-6 inline-block">
          <Button>Browse Products</Button>
        </Link>
      </Card>
    </div>
  );
}
