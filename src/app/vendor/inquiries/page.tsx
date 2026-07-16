"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getInquiries, submitQuote, type Inquiry } from "@/lib/vendor-api";
import { BUDGET_RANGE_LABELS, EVENT_TYPE_LABELS } from "@/lib/types";

function formatCountdown(deadlineAt: string): string {
  const diffMs = new Date(deadlineAt).getTime() - Date.now();
  if (diffMs <= 0) return "Expired";
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m left`;
}

const itemRowSchema = z.object({
  item: z.string().min(1, "Required"),
  qty: z.string().min(1, "Required"),
  unitPrice: z.string().min(1, "Required"),
});

const quoteSchema = z.object({
  basePrice: z.string().min(1, "Base price is required"),
  notes: z.string().optional(),
  itemization: z.array(itemRowSchema),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

export default function VendorInquiriesPage() {
  const queryClient = useQueryClient();
  const [viewingInquiry, setViewingInquiry] = useState<Inquiry | null>(null);
  const [quotingInquiry, setQuotingInquiry] = useState<Inquiry | null>(null);

  const { data: inquiries, isLoading, isError } = useQuery({
    queryKey: ["vendor-inquiries"],
    queryFn: getInquiries,
    // New inquiries can arrive at any time from matching; poll so vendors
    // see them without a manual refresh.
    refetchInterval: 15000,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: { basePrice: "", notes: "", itemization: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "itemization" });

  const mutation = useMutation({
    mutationFn: (values: QuoteFormValues) =>
      submitQuote(quotingInquiry!.requestId, {
        basePrice: parseFloat(values.basePrice),
        notes: values.notes || undefined,
        itemization: values.itemization.map((row) => {
          const qty = parseFloat(row.qty);
          const unitPrice = parseFloat(row.unitPrice);
          return { item: row.item, qty, unitPrice, total: qty * unitPrice };
        }),
      }),
    onSuccess: () => {
      toast.success("Quote submitted!");
      queryClient.invalidateQueries({ queryKey: ["vendor-inquiries"] });
      setQuotingInquiry(null);
      reset({ basePrice: "", notes: "", itemization: [] });
    },
    onError: () => {
      toast.error("Couldn't submit your quote. Please try again.");
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Customer inquiries</h1>
        <p className="text-muted-foreground">Respond within 24 hours to win the booking.</p>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {isError && (
        <p className="text-sm text-destructive">Couldn&apos;t load your inquiries.</p>
      )}
      {!isLoading && inquiries && inquiries.length === 0 && (
        <p className="text-muted-foreground">No pending inquiries right now.</p>
      )}

      {!isLoading && inquiries && inquiries.length > 0 && (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.requestId}>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">
                    {EVENT_TYPE_LABELS[inquiry.eventType] ?? inquiry.eventType}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {inquiry.eventDate
                      ? new Date(inquiry.eventDate).toLocaleDateString()
                      : "Date TBD"}{" "}
                    · {inquiry.guestCount ?? "?"} guests ·{" "}
                    {BUDGET_RANGE_LABELS[inquiry.budgetRange] ?? inquiry.budgetRange}
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {formatCountdown(inquiry.deadlineAt)}
                </span>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setViewingInquiry(inquiry)}>
                  View inquiry
                </Button>
                <Button size="sm" onClick={() => setQuotingInquiry(inquiry)}>
                  Submit quote
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={Boolean(viewingInquiry)} onOpenChange={(open) => !open && setViewingInquiry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inquiry details</DialogTitle>
          </DialogHeader>
          {viewingInquiry && (
            <div className="space-y-3 text-sm">
              <p>
                <span className="font-medium">Event:</span>{" "}
                {EVENT_TYPE_LABELS[viewingInquiry.eventType] ?? viewingInquiry.eventType}
              </p>
              <p>
                <span className="font-medium">Date:</span>{" "}
                {viewingInquiry.eventDate
                  ? new Date(viewingInquiry.eventDate).toLocaleDateString()
                  : "TBD"}
              </p>
              <p>
                <span className="font-medium">Guests:</span> {viewingInquiry.guestCount ?? "?"}
              </p>
              <p>
                <span className="font-medium">Budget:</span>{" "}
                {BUDGET_RANGE_LABELS[viewingInquiry.budgetRange] ?? viewingInquiry.budgetRange}
              </p>
              {viewingInquiry.specialRequirements && (
                <p>
                  <span className="font-medium">Special requirements:</span>{" "}
                  {viewingInquiry.specialRequirements}
                </p>
              )}
              {viewingInquiry.questionnaire && (
                <div>
                  <p className="font-medium">Questionnaire</p>
                  <ul className="list-inside list-disc text-muted-foreground">
                    {Object.entries(viewingInquiry.questionnaire).map(([key, value]) => (
                      <li key={key}>
                        {key}: {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(quotingInquiry)}
        onOpenChange={(open) => {
          if (!open) {
            setQuotingInquiry(null);
            reset({ basePrice: "", notes: "", itemization: [] });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit a quote</DialogTitle>
            <DialogDescription>
              {quotingInquiry &&
                `${EVENT_TYPE_LABELS[quotingInquiry.eventType] ?? quotingInquiry.eventType}, ${
                  quotingInquiry.guestCount ?? "?"
                } guests`}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
          >
            <div className="space-y-2">
              <Label htmlFor="basePrice">Base price (₦)</Label>
              <Input id="basePrice" type="number" min="0" {...register("basePrice")} />
              {errors.basePrice && (
                <p className="text-sm text-destructive">{errors.basePrice.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Itemization</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ item: "", qty: "1", unitPrice: "" })}
                >
                  Add row
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_60px_90px_auto] gap-2">
                  <Input
                    placeholder="Item"
                    {...register(`itemization.${index}.item` as const)}
                  />
                  <Input
                    placeholder="Qty"
                    type="number"
                    min="1"
                    {...register(`itemization.${index}.qty` as const)}
                  />
                  <Input
                    placeholder="Unit price"
                    type="number"
                    min="0"
                    {...register(`itemization.${index}.unitPrice` as const)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} {...register("notes")} />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Submitting..." : "Submit quote"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
