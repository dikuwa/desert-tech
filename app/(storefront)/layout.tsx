import { StorefrontHeader } from "@/components/storefront/header";
import { StorefrontFooter } from "@/components/storefront/footer";
import { MobileStickyCTA } from "@/components/storefront/mobile-cta";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StorefrontHeader />
      <main className="flex-1">{children}</main>
      <StorefrontFooter />
      <MobileStickyCTA />
    </>
  );
}
