"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { getErrorMessage } from "@/lib/get-error-message";
import {
  BUDGET_RANGE_LABELS,
  BudgetRange,
  EVENT_TYPE_LABELS,
  EventType,
  VENDOR_CATEGORY_LABELS,
  VendorCategory,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const eventTypeValues = Object.values(EventType) as [string, ...string[]];
const budgetRangeValues = Object.values(BudgetRange) as [string, ...string[]];
const vendorCategoryValues = Object.values(VendorCategory) as [string, ...string[]];

const questionnaireSchema = z.object({
  eventType: z.enum(eventTypeValues, { error: "Select an event type" }),
  eventDate: z
    .string()
    .optional()
    .refine(
      (value) => !value || value >= new Date().toISOString().slice(0, 10),
      { error: "Event date can't be in the past" }
    ),
  eventTime: z.string().optional(),
  customTimeFrom: z.string().optional(),
  customTimeTo: z.string().optional(),
  guestCount: z.string().optional(),
  location: z.string().optional(),
  servicesNeeded: z.array(z.enum(vendorCategoryValues)).optional(),
  hasVenue: z.string().optional(),
  venueSetting: z.string().optional(),
  venueStyle: z.string().optional(),
  cateringStyle: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  entertainmentType: z.array(z.string()).optional(),
  musicGenre: z.string().optional(),
  photoVideoNeeds: z.string().optional(),
  themeColor: z.string().optional(),
  attireNeeds: z.string().optional(),
  transportationNeeds: z.string().optional(),
  accessibilityRequirements: z.string().optional(),
  budgetRange: z.enum(budgetRangeValues, { error: "Select a budget range" }),
  priorities: z.string().optional(),
  specialRequirements: z.string().optional(),
});

type QuestionnaireFormValues = z.infer<typeof questionnaireSchema>;

const EVENT_TIME_OPTIONS = [
  { value: "MORNING", label: "Morning" },
  { value: "AFTERNOON", label: "Afternoon" },
  { value: "EVENING", label: "Evening" },
  { value: "CUSTOM", label: "Custom time range" },
  { value: "NOT_SURE", label: "Not sure yet" },
];

const VENUE_STATUS_OPTIONS = [
  { value: "HAVE_VENUE", label: "I already have a venue" },
  { value: "NEED_HELP", label: "I need help finding one" },
];

const VENUE_SETTING_OPTIONS = [
  { value: "INDOOR", label: "Indoor" },
  { value: "OUTDOOR", label: "Outdoor" },
  { value: "NO_PREFERENCE", label: "No preference" },
];

const CATERING_STYLE_OPTIONS = [
  { value: "BUFFET", label: "Buffet" },
  { value: "PLATED", label: "Plated" },
  { value: "COCKTAIL", label: "Cocktail / small chops" },
];

const ENTERTAINMENT_OPTIONS = [
  { value: "DJ", label: "DJ" },
  { value: "LIVE_BAND", label: "Live band" },
  { value: "MC", label: "MC / host" },
];

const PHOTO_VIDEO_OPTIONS = [
  { value: "PHOTOGRAPHY", label: "Photography only" },
  { value: "VIDEOGRAPHY", label: "Videography only" },
  { value: "BOTH", label: "Both" },
];

const PRIORITY_OPTIONS = [
  { value: "BUDGET", label: "Staying within budget" },
  { value: "QUALITY", label: "Getting the best quality" },
  { value: "SPEED", label: "Getting matched quickly" },
];

const DRAFT_STORAGE_KEY = "nkwado-questionnaire-draft";

interface QuestionnaireDraft {
  values: Partial<QuestionnaireFormValues>;
  stepIndex: number;
}

function loadDraft(): QuestionnaireDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QuestionnaireDraft) : null;
  } catch {
    return null;
  }
}

function saveDraft(draft: QuestionnaireDraft) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

function clearDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRAFT_STORAGE_KEY);
}

type StepKey =
  | "basics"
  | "services"
  | "venue"
  | "catering"
  | "entertainment"
  | "photo"
  | "decor"
  | "attire"
  | "logistics"
  | "final";

const STEP_LABELS: Record<StepKey, string> = {
  basics: "Tell us about your event",
  services: "What do you need help with?",
  venue: "Venue",
  catering: "Catering",
  entertainment: "Entertainment",
  photo: "Photography & video",
  decor: "Decoration & theme",
  attire: "Attire",
  logistics: "Logistics",
  final: "Budget & final details",
};

const STEP_FIELDS: Record<StepKey, (keyof QuestionnaireFormValues)[]> = {
  basics: ["eventType", "eventDate", "eventTime", "customTimeFrom", "customTimeTo", "guestCount", "location"],
  services: ["servicesNeeded"],
  venue: ["hasVenue", "venueSetting", "venueStyle"],
  catering: ["cateringStyle", "dietaryRestrictions"],
  entertainment: ["entertainmentType", "musicGenre"],
  photo: ["photoVideoNeeds"],
  decor: ["themeColor"],
  attire: ["attireNeeds"],
  logistics: ["transportationNeeds", "accessibilityRequirements"],
  final: ["budgetRange", "priorities", "specialRequirements"],
};

function ToggleGroup({
  options,
  value,
  onChange,
  multi = false,
}: {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (next: string[]) => void;
  multi?: boolean;
}) {
  const toggle = (v: string) => {
    if (multi) {
      onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
    } else {
      onChange(value.includes(v) ? [] : [v]);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => toggle(opt.value)}
          className={cn(
            "rounded-md border px-3 py-2 text-left text-sm transition-colors",
            value.includes(opt.value)
              ? "border-primary bg-primary/5 font-medium"
              : "border-input hover:bg-accent"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function EventQuestionnairePage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    getValues,
    reset,
    control,
    formState: { errors },
  } = useForm<QuestionnaireFormValues>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: { servicesNeeded: [], entertainmentType: [] },
  });

  // Restore an in-progress questionnaire if the tab was closed before submitting.
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      reset({ servicesNeeded: [], entertainmentType: [], ...draft.values });
      setStepIndex(draft.stepIndex);
      toast.info("We restored your in-progress questionnaire.");
    }
    // Only run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only fields that drive conditional rendering / ToggleGroup selection state
  // are watched reactively -- plain register()'d text/date/number inputs are
  // uncontrolled and don't need to trigger a re-render on every keystroke
  // (which was interrupting the native date picker popup).
  const eventType = useWatch({ control, name: "eventType" });
  const eventTime = useWatch({ control, name: "eventTime" });
  const servicesNeededRaw = useWatch({ control, name: "servicesNeeded" });
  const hasVenue = useWatch({ control, name: "hasVenue" });
  const venueSetting = useWatch({ control, name: "venueSetting" });
  const cateringStyle = useWatch({ control, name: "cateringStyle" });
  const entertainmentTypeRaw = useWatch({ control, name: "entertainmentType" });
  const photoVideoNeeds = useWatch({ control, name: "photoVideoNeeds" });
  const budgetRange = useWatch({ control, name: "budgetRange" });
  const priorities = useWatch({ control, name: "priorities" });

  const servicesNeeded = useMemo(() => servicesNeededRaw ?? [], [servicesNeededRaw]);
  const entertainmentType = useMemo(() => entertainmentTypeRaw ?? [], [entertainmentTypeRaw]);

  const activeSteps = useMemo<StepKey[]>(() => {
    const steps: StepKey[] = ["basics", "services"];
    if (servicesNeeded.includes("VENUE")) steps.push("venue");
    if (servicesNeeded.includes("CATERING")) steps.push("catering");
    if (servicesNeeded.includes("DJ") || servicesNeeded.includes("LIVE_BAND")) {
      steps.push("entertainment");
    }
    if (servicesNeeded.includes("PHOTOGRAPHY") || servicesNeeded.includes("VIDEOGRAPHY")) {
      steps.push("photo");
    }
    if (servicesNeeded.includes("DECORATION") || servicesNeeded.includes("FLORIST")) {
      steps.push("decor");
    }
    if (servicesNeeded.includes("DRESSES") || servicesNeeded.includes("SUITS")) {
      steps.push("attire");
    }
    steps.push("logistics", "final");
    return steps;
  }, [servicesNeeded]);

  const stepKey = activeSteps[Math.min(stepIndex, activeSteps.length - 1)];
  const totalSteps = activeSteps.length;

  const mutation = useMutation({
    mutationFn: submitQuestionnaire,
    onSuccess: (request) => {
      clearDraft();
      toast.success("We're matching vendors for you!");
      router.push(`/dashboard/matching-results?requestId=${request.id}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Couldn't submit your questionnaire. Please try again."));
    },
  });

  const goNext = async () => {
    const valid = await trigger(STEP_FIELDS[stepKey]);
    if (!valid) return;
    const nextIndex = Math.min(stepIndex + 1, totalSteps - 1);
    setStepIndex(nextIndex);
    saveDraft({ values: getValues(), stepIndex: nextIndex });
  };

  const goBack = () => {
    const prevIndex = Math.max(stepIndex - 1, 0);
    setStepIndex(prevIndex);
    saveDraft({ values: getValues(), stepIndex: prevIndex });
  };

  const onSubmit = (form: QuestionnaireFormValues) => {
    mutation.mutate({
      eventType: form.eventType as EventType,
      eventDate: form.eventDate || undefined,
      guestCount: form.guestCount ? parseInt(form.guestCount, 10) : undefined,
      location: form.location || undefined,
      budgetRange: form.budgetRange as BudgetRange,
      specialRequirements: form.specialRequirements || undefined,
      questionnaire: {
        eventTime: form.eventTime || "",
        customTimeFrom: form.customTimeFrom || "",
        customTimeTo: form.customTimeTo || "",
        servicesNeeded: form.servicesNeeded ?? [],
        hasVenue: form.hasVenue || "",
        venueSetting: form.venueSetting || "",
        venueStyle: form.venueStyle || "",
        cateringStyle: form.cateringStyle || "",
        dietaryRestrictions: form.dietaryRestrictions || "",
        entertainmentType: form.entertainmentType ?? [],
        musicGenre: form.musicGenre || "",
        photoVideoNeeds: form.photoVideoNeeds || "",
        themeColor: form.themeColor || "",
        attireNeeds: form.attireNeeds || "",
        transportationNeeds: form.transportationNeeds || "",
        accessibilityRequirements: form.accessibilityRequirements || "",
        priorities: form.priorities || "",
      },
    });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{STEP_LABELS[stepKey]}</CardTitle>
          <CardDescription>
            Step {stepIndex + 1} of {totalSteps}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {stepKey === "basics" && (
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
                  <Input
                    id="eventDate"
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    {...register("eventDate")}
                  />
                  {errors.eventDate && (
                    <p className="text-sm text-destructive">{errors.eventDate.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Time of day</Label>
                  <ToggleGroup
                    options={EVENT_TIME_OPTIONS}
                    value={eventTime ? [eventTime] : []}
                    onChange={(next) => setValue("eventTime", next[0] ?? "")}
                  />
                  {eventTime === "CUSTOM" && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1">
                        <Label htmlFor="customTimeFrom" className="text-xs text-muted-foreground">
                          From
                        </Label>
                        <Input id="customTimeFrom" type="time" {...register("customTimeFrom")} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="customTimeTo" className="text-xs text-muted-foreground">
                          To
                        </Label>
                        <Input id="customTimeTo" type="time" {...register("customTimeTo")} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestCount">Guest count</Label>
                  <Input id="guestCount" type="number" min="1" {...register("guestCount")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="e.g. Lagos Island" {...register("location")} />
                </div>
              </>
            )}

            {stepKey === "services" && (
              <div className="space-y-2">
                <Label>Select everything you&apos;d like us to match you with</Label>
                <ToggleGroup
                  options={Object.entries(VENDOR_CATEGORY_LABELS).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                  value={servicesNeeded}
                  onChange={(next) => setValue("servicesNeeded", next as VendorCategory[])}
                  multi
                />
              </div>
            )}

            {stepKey === "venue" && (
              <>
                <div className="space-y-2">
                  <Label>Venue status</Label>
                  <ToggleGroup
                    options={VENUE_STATUS_OPTIONS}
                    value={hasVenue ? [hasVenue] : []}
                    onChange={(next) => setValue("hasVenue", next[0] ?? "")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Indoor or outdoor?</Label>
                  <ToggleGroup
                    options={VENUE_SETTING_OPTIONS}
                    value={venueSetting ? [venueSetting] : []}
                    onChange={(next) => setValue("venueSetting", next[0] ?? "")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venueStyle">What venue style are you picturing?</Label>
                  <Input
                    id="venueStyle"
                    placeholder="Garden, hall, beach, rooftop, hotel..."
                    {...register("venueStyle")}
                  />
                </div>
              </>
            )}

            {stepKey === "catering" && (
              <>
                <div className="space-y-2">
                  <Label>Catering style</Label>
                  <ToggleGroup
                    options={CATERING_STYLE_OPTIONS}
                    value={cateringStyle ? [cateringStyle] : []}
                    onChange={(next) => setValue("cateringStyle", next[0] ?? "")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dietaryRestrictions">
                    Dietary restrictions or must-have dishes
                  </Label>
                  <Textarea id="dietaryRestrictions" rows={3} {...register("dietaryRestrictions")} />
                </div>
              </>
            )}

            {stepKey === "entertainment" && (
              <>
                <div className="space-y-2">
                  <Label>What kind of entertainment do you want?</Label>
                  <ToggleGroup
                    options={ENTERTAINMENT_OPTIONS}
                    value={entertainmentType}
                    onChange={(next) => setValue("entertainmentType", next)}
                    multi
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="musicGenre">Any specific music genre or vibe?</Label>
                  <Input id="musicGenre" {...register("musicGenre")} />
                </div>
              </>
            )}

            {stepKey === "photo" && (
              <div className="space-y-2">
                <Label>Photography, videography, or both?</Label>
                <ToggleGroup
                  options={PHOTO_VIDEO_OPTIONS}
                  value={photoVideoNeeds ? [photoVideoNeeds] : []}
                  onChange={(next) => setValue("photoVideoNeeds", next[0] ?? "")}
                />
              </div>
            )}

            {stepKey === "decor" && (
              <div className="space-y-2">
                <Label htmlFor="themeColor">Do you have a theme or color scheme in mind?</Label>
                <Input id="themeColor" placeholder="Gold and white, e.g." {...register("themeColor")} />
              </div>
            )}

            {stepKey === "attire" && (
              <div className="space-y-2">
                <Label htmlFor="attireNeeds">Tell us about the attire you need</Label>
                <Textarea
                  id="attireNeeds"
                  placeholder="Sizes, style, number of outfits, etc."
                  rows={3}
                  {...register("attireNeeds")}
                />
              </div>
            )}

            {stepKey === "logistics" && (
              <>
                {servicesNeeded.includes("TRANSPORTATION") && (
                  <div className="space-y-2">
                    <Label htmlFor="transportationNeeds">Tell us about your transportation needs</Label>
                    <Textarea
                      id="transportationNeeds"
                      placeholder="Number of vehicles, pickup locations, etc."
                      rows={3}
                      {...register("transportationNeeds")}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="accessibilityRequirements">
                    Any accessibility requirements we should know about?
                  </Label>
                  <Textarea id="accessibilityRequirements" rows={3} {...register("accessibilityRequirements")} />
                </div>
              </>
            )}

            {stepKey === "final" && (
              <>
                <div className="space-y-2">
                  <Label>Budget range</Label>
                  <ToggleGroup
                    options={Object.entries(BUDGET_RANGE_LABELS).map(([value, label]) => ({
                      value,
                      label,
                    }))}
                    value={budgetRange ? [budgetRange] : []}
                    onChange={(next) => setValue("budgetRange", (next[0] ?? "") as BudgetRange)}
                  />
                  {errors.budgetRange && (
                    <p className="text-sm text-destructive">{errors.budgetRange.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>What matters most to you?</Label>
                  <ToggleGroup
                    options={PRIORITY_OPTIONS}
                    value={priorities ? [priorities] : []}
                    onChange={(next) => setValue("priorities", next[0] ?? "")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialRequirements">Anything else we should know?</Label>
                  <Textarea
                    id="specialRequirements"
                    placeholder="Vegetarian options, no shellfish, etc."
                    rows={5}
                    {...register("specialRequirements")}
                  />
                </div>
              </>
            )}

            <div className="flex justify-between pt-2">
              {stepIndex > 0 ? (
                <Button type="button" variant="outline" onClick={goBack}>
                  Back
                </Button>
              ) : (
                <span />
              )}
              {stepIndex < totalSteps - 1 ? (
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
