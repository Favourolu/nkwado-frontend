import { AuthGuard } from "@/components/AuthGuard";
import { SectionHeader } from "@/components/SectionHeader";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Bookings", href: "/dashboard/bookings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard role="CUSTOMER">
      <SectionHeader navItems={NAV_ITEMS} />
      {children}
    </AuthGuard>
  );
}
