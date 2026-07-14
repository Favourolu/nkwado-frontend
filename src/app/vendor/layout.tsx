import { AuthGuard } from "@/components/AuthGuard";
import { SectionHeader } from "@/components/SectionHeader";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/vendor/dashboard" },
  { label: "Profile", href: "/vendor/profile" },
  { label: "Inquiries", href: "/vendor/inquiries" },
  { label: "Quotes", href: "/vendor/quotes" },
  { label: "Bookings", href: "/vendor/bookings" },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard role="VENDOR">
      <SectionHeader navItems={NAV_ITEMS} />
      {children}
    </AuthGuard>
  );
}
