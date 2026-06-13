import { StorefrontHeader } from "@/components/storefront/header";
import { StorefrontFooter } from "@/components/storefront/footer";
import { MobileStickyCTA } from "@/components/storefront/mobile-cta";
import { MobileDrawer } from "@/components/storefront/mobile-drawer";
import { ProductSync } from "@/components/product-sync";
import { CatalogSync } from "@/components/catalog-sync";
import { StorefrontToaster } from "@/components/ui/storefront-toaster";
import { StoreDataSync } from "@/components/store-data-sync";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ProductSync />
      <CatalogSync />
      <StoreDataSync />
      <StorefrontHeader />
      <main className="flex-1">{children}</main>
      <StorefrontFooter />
      <MobileStickyCTA />
      <MobileDrawer />
      <StorefrontToaster />
    </>
  );
}
