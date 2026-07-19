import { AuthGuard } from "@/components/AuthGuard";
import { SectionHeader } from "@/components/SectionHeader";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Vendor vetting", href: "/admin/vendors/pending" },
  { label: "All vendors", href: "/admin/vendors/all" },
  { label: "Requests", href: "/admin/requests" },
  { label: "Bookings", href: "/admin/bookings" },
  { label: "Revenue", href: "/admin/revenue" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard role="ADMIN">
      <SectionHeader navItems={NAV_ITEMS} />
      {children}
    </AuthGuard>
  );
}
