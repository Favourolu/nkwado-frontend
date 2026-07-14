"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  CalendarCheck,
  Camera,
  Car,
  Flower2,
  Music2,
  ShieldCheck,
  Shirt,
  Sparkles,
  UtensilsCrossed,
  Warehouse,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PeacockMark } from "./PeacockMark";
import { TiltCard } from "./TiltCard";
import { EVENT_TYPE_LABELS } from "@/lib/types";

const PeacockHeroScene = dynamic(
  () => import("@/components/three/PeacockHeroScene").then((m) => m.PeacockHeroScene),
  { ssr: false }
);

const JourneyScene = dynamic(
  () => import("@/components/three/JourneyScene").then((m) => m.JourneyScene),
  { ssr: false }
);

const JOURNEY_STEPS = [
  { name: "Tell us about your event" },
  { name: "We match your vendors" },
  { name: "Review quotes" },
  { name: "Confirm your booking" },
  { name: "Enjoy your event" },
];

const CATEGORY_CARDS: {
  title: string;
  subtitle: string;
  gradient: string;
  icon: typeof UtensilsCrossed;
  size?: "sm" | "lg";
}[] = [
  {
    title: "Catering",
    subtitle: "Buffet, plated, or small chops",
    gradient: "bg-gradient-to-br from-amber-600 to-amber-400",
    icon: UtensilsCrossed,
    size: "lg",
  },
  {
    title: "Venue",
    subtitle: "Halls, gardens, rooftops, hotels",
    gradient: "bg-gradient-to-br from-teal-700 to-teal-400",
    icon: Warehouse,
    size: "lg",
  },
  { title: "DJ", subtitle: "Sets the mood", gradient: "bg-gradient-to-br from-violet-700 to-violet-400", icon: Music2 },
  { title: "Live Band", subtitle: "Live entertainment", gradient: "bg-gradient-to-br from-fuchsia-700 to-fuchsia-400", icon: Music2 },
  { title: "Photography", subtitle: "Every moment, captured", gradient: "bg-gradient-to-br from-blue-800 to-blue-500", icon: Camera },
  { title: "Videography", subtitle: "Cinematic highlight reels", gradient: "bg-gradient-to-br from-cyan-700 to-cyan-400", icon: Camera },
  { title: "Decoration", subtitle: "Your theme, brought to life", gradient: "bg-gradient-to-br from-emerald-700 to-emerald-400", icon: Sparkles },
  { title: "Florist", subtitle: "Fresh arrangements", gradient: "bg-gradient-to-br from-rose-700 to-rose-400", icon: Flower2 },
  { title: "Planner", subtitle: "Full-service coordination", gradient: "bg-gradient-to-br from-indigo-700 to-indigo-400", icon: CalendarCheck },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Vetted vendors only",
    description: "Every vendor on Nkwado is reviewed before they can take a booking.",
  },
  {
    icon: Zap,
    title: "Quotes within 24 hours",
    description: "Vendors respond fast, so you're never stuck waiting on a reply.",
  },
  {
    icon: CalendarCheck,
    title: "One booking, every vendor",
    description: "Confirm your caterer, venue, and DJ together, in a single checkout.",
  },
  {
    icon: Car,
    title: "Support to the finish line",
    description: "From first quote to the day of your event, we're tracking progress with you.",
  },
];

const FLOATING_BADGES = [
  { icon: UtensilsCrossed, style: "left-6 top-8" },
  { icon: Music2, style: "right-6 top-16" },
  { icon: Camera, style: "left-10 bottom-16" },
  { icon: Shirt, style: "right-10 bottom-8" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <PeacockMark className="h-9 w-9" />
          <span className="text-lg font-semibold tracking-tight">Nkwado</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground sm:flex">
          <a href="#how-it-works" className="hover:text-foreground">How it works</a>
          <a href="#categories" className="hover:text-foreground">Categories</a>
          <a href="#why-nkwado" className="hover:text-foreground">Why Nkwado</a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button asChild variant="ghost">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild className="rounded-full px-5 font-semibold">
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-2 sm:pb-16">
        <div className="relative overflow-hidden rounded-[2rem] border shadow-xl">
          <div className="h-[420px] w-full sm:h-[520px]">
            <PeacockHeroScene />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Every vendor your event needs, in one place
          </div>
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-5 p-6 sm:p-10">
            <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Every vendor your event needs, curated into one beautiful display
            </h1>
            <p className="max-w-xl text-sm text-white/80 sm:text-base">
              Answer a few questions and Nkwado matches you with vetted caterers, venues, DJs,
              photographers and more, quoted within 24 hours, booked with confidence.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full font-semibold">
                <Link href="/register">Start planning</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/40 bg-white/10 font-semibold text-white hover:bg-white/20 hover:text-white"
              >
                <Link href="/register">I&apos;m a vendor</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
          <p className="text-muted-foreground">
            From idea to booked event in five simple steps.
          </p>
        </div>
        <div className="h-[360px] sm:h-[420px]">
          <JourneyScene steps={JOURNEY_STEPS} />
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            One display, every color of vendor
          </h2>
          <p className="text-muted-foreground">
            Like a peacock&apos;s feathers, every vendor category comes together for your event.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CATEGORY_CARDS.filter((c) => c.size === "lg").map((card) => (
            <TiltCard key={card.title} {...card} />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CATEGORY_CARDS.filter((c) => c.size !== "lg").map((card) => (
            <TiltCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      {/* Why Nkwado: editorial split section */}
      <section id="why-nkwado" className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 sm:grid-cols-2 sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Every event, perfectly planned
            </h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              Built for the way events actually come together: many vendors, one plan, zero
              guesswork.
            </p>
            <div className="mt-8 space-y-6">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-medium">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border bg-gradient-to-br from-primary/5 to-primary/10 p-8">
            <div className="flex h-full min-h-[320px] items-center justify-center">
              <PeacockMark className="h-40 w-40" />
            </div>
            {FLOATING_BADGES.map((badge, i) => (
              <div
                key={i}
                className={`absolute flex h-12 w-12 items-center justify-center rounded-full border bg-card shadow-md ${badge.style}`}
              >
                <badge.icon className="h-5 w-5 text-foreground/70" strokeWidth={1.75} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-[2rem] bg-foreground px-6 py-14 text-center text-background sm:px-16">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Planning a {EVENT_TYPE_LABELS.WEDDING.toLowerCase()}, {EVENT_TYPE_LABELS.BIRTHDAY.toLowerCase()}, or something else?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-background/70">
            Nkwado handles it all, from intimate gatherings to large celebrations.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="rounded-full font-semibold">
              <Link href="/register">Plan my event</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-background/30 bg-transparent font-semibold text-background hover:bg-background/10 hover:text-background"
            >
              <Link href="/register">Become a vendor</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t px-4 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Nkwado. All rights reserved.
      </footer>
    </div>
  );
}
