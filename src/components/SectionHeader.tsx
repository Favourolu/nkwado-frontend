"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { PeacockMark } from "@/components/landing/PeacockMark";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
}

export function SectionHeader({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAuth } = useAuth();

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <PeacockMark className="h-7 w-7" />
          <span className="font-semibold">Nkwado</span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent",
                pathname === item.href
                  ? "bg-accent font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </header>
  );
}
