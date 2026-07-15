"use client";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoans, type LoanStatus } from "@/lib/customer-api";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<LoanStatus, string> = {
  PENDING_REVIEW: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  DISBURSED: "Disbursed",
};

const STATUS_STYLES: Record<LoanStatus, string> = {
  PENDING_REVIEW: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  APPROVED: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  REJECTED: "bg-red-500/10 text-red-600 border-red-500/30",
  DISBURSED: "bg-green-500/10 text-green-600 border-green-500/30",
};

const STATUS_DESCRIPTIONS: Record<LoanStatus, string> = {
  PENDING_REVIEW: "We're reviewing your application. Your vendors are already locked in either way.",
  APPROVED: "Your financing has been approved. Funds will be disbursed to your vendors shortly.",
  REJECTED: "This application wasn't approved. You can pay the remaining balance in full instead.",
  DISBURSED: "Funds have been sent to your vendors. Your regular repayment schedule has started.",
};

export default function MyFinancingPage() {
  const { data: loans, isLoading, isError } = useQuery({
    queryKey: ["customer-loans"],
    queryFn: getLoans,
    refetchInterval: (query) =>
      (query.state.data ?? []).some((l) => l.status === "PENDING_REVIEW") ? 15000 : false,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">My financing</h1>
        <p className="text-muted-foreground">
          Every financing application you&apos;ve submitted, and where it stands.
        </p>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      {isError && (
        <p className="text-sm text-destructive">Couldn&apos;t load your financing applications. Please try again.</p>
      )}

      {!isLoading && !isError && (loans?.length ?? 0) === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            You haven&apos;t applied for financing on any booking yet.
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {loans?.map((loan) => (
          <Card key={loan.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="text-base">
                  {loan.tenorMonths ? `${loan.tenorMonths}-month plan` : "Financing plan"}
                </CardTitle>
                <CardDescription>{formatNaira(loan.amount)} financed</CardDescription>
              </div>
              <Badge
                variant="outline"
                className={cn("whitespace-nowrap", STATUS_STYLES[loan.status])}
              >
                {STATUS_LABELS[loan.status]}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {(loan.monthlyPayment || loan.totalRepayable) && (
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                  {loan.monthlyPayment && <span>Monthly: {formatNaira(loan.monthlyPayment)}</span>}
                  {loan.totalRepayable && (
                    <span>Total repayable: {formatNaira(loan.totalRepayable)}</span>
                  )}
                </div>
              )}
              <p className="text-sm text-muted-foreground">{STATUS_DESCRIPTIONS[loan.status]}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
