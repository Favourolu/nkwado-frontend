"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitQuestionnaire } from "@/lib/customer-api";
import { BUDGET_RANGE_LABELS, BudgetRange, EVENT_TYPE_LABELS, EventType } from "@/lib/types";
import { cn } from "@/lib/utils";

const eventTypeValues = Object.values(EventType) as [string, ...string[]];
const budgetRangeValues = Object.values(BudgetRange) as [string, ...string[]];

const questionnaireSchema = z.object({
  eventType: z.enum(eventTypeValues, { error: "Select an event type" }),
  eventDate: z.string().optional(),
  guestCount: z.string().optional(),
  location: z.string().optional(),
  budgetRange: z.enum(budgetRangeValues, { error: "Select a budget range" }),
  specialRequirements: z.string().optional(),
});

type QuestionnaireFormValues = z.infer<typeof questionnaireSchema>;

const STEP_FIELDS: Record<number, (keyof QuestionnaireFormValues)[]> = {
  1: ["eventType", "eventDate", "guestCount"],
  2: ["location", "budgetRange"],
  3: ["specialRequirements"],
};

const TOTAL_STEPS = 3;

export default function EventQuestionnairePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QuestionnaireFormValues>({
    resolver: zodResolver(questionnaireSchema),
  });

  const eventType = watch("eventType");
  const budgetRange = watch("budgetRange");

  const mutation = useMutation({
    mutationFn: submitQuestionnaire,
    onSuccess: (request) => {
      toast.success("We're matching vendors for you!");
      router.push(`/dashboard/matching-results?requestId=${request.id}`);
    },
    onError: () => {
      toast.error("Couldn't submit your questionnaire. Please try again.");
    },
  });

  const goNext = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = (values: QuestionnaireFormValues) => {
    mutation.mutate({
      eventType: values.eventType as EventType,
      eventDate: values.eventDate || undefined,
      guestCount: values.guestCount ? parseInt(values.guestCount, 10) : undefined,
      location: values.location || undefined,
      budgetRange: values.budgetRange as BudgetRange,
      specialRequirements: values.specialRequirements || undefined,
    });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Tell us about your event</CardTitle>
          <CardDescription>Step {step} of {TOTAL_STEPS}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label>Event type</Label>
                  <Select
                    value={eventType}
                    onValueChange={(value) => setValue("eventType", value as EventType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.eventType && (
                    <p className="text-sm text-destructive">{errors.eventType.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Event date</Label>
                  <Input id="eventDate" type="date" {...register("eventDate")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestCount">Guest count</Label>
                  <Input id="guestCount" type="number" min="1" {...register("guestCount")} />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="e.g. Lagos Island" {...register("location")} />
                </div>
                <div className="space-y-2">
                  <Label>Budget range</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(BUDGET_RANGE_LABELS).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setValue("budgetRange", value as BudgetRange)}
                        className={cn(
                          "rounded-md border px-3 py-2 text-left text-sm transition-colors",
                          budgetRange === value
                            ? "border-primary bg-primary/5 font-medium"
                            : "border-input hover:bg-accent"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {errors.budgetRange && (
                    <p className="text-sm text-destructive">{errors.budgetRange.message}</p>
                  )}
                </div>
              </>
            )}

            {step === 3 && (
              <div className="space-y-2">
                <Label htmlFor="specialRequirements">Special requirements</Label>
                <Textarea
                  id="specialRequirements"
                  placeholder="Vegetarian options, no shellfish, etc."
                  rows={5}
                  {...register("specialRequirements")}
                />
              </div>
            )}

            <div className="flex justify-between pt-2">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={goBack}>
                  Back
                </Button>
              ) : (
                <span />
              )}
              {step < TOTAL_STEPS ? (
                <Button type="button" onClick={goNext}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Submitting..." : "Submit"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
