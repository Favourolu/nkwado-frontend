import { AuthGuard } from "@/components/AuthGuard";
import { SectionHeader } from "@/components/SectionHeader";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My Events", href: "/dashboard/my-events" },
  { label: "Bookings", href: "/dashboard/bookings" },
  { label: "Financing", href: "/dashboard/loans" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard role="CUSTOMER">
      <SectionHeader navItems={NAV_ITEMS} />
      {children}
    </AuthGuard>
  );
}
