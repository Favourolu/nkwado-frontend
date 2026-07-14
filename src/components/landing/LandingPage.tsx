"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

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

const CATEGORY_CARDS: { title: string; gradient: string }[] = [
  { title: "Catering", gradient: "bg-gradient-to-br from-amber-600 to-amber-400" },
  { title: "Venue", gradient: "bg-gradient-to-br from-teal-700 to-teal-400" },
  { title: "DJ", gradient: "bg-gradient-to-br from-violet-700 to-violet-400" },
  { title: "Live Band", gradient: "bg-gradient-to-br from-fuchsia-700 to-fuchsia-400" },
  { title: "Photography", gradient: "bg-gradient-to-br from-blue-800 to-blue-500" },
  { title: "Videography", gradient: "bg-gradient-to-br from-cyan-700 to-cyan-400" },
  { title: "Decoration", gradient: "bg-gradient-to-br from-emerald-700 to-emerald-400" },
  { title: "Florist", gradient: "bg-gradient-to-br from-rose-700 to-rose-400" },
  { title: "Planner", gradient: "bg-gradient-to-br from-indigo-700 to-indigo-400" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <PeacockMark className="h-9 w-9" />
          <span className="text-lg font-semibold tracking-tight">Nkwado</span>
        </div>
        <nav className="flex items-center gap-3">
          <ThemeToggle />
          <Button asChild variant="ghost">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </nav>
      </header>

      <section className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-8 pt-2 text-center sm:pb-16">
        <div className="h-[280px] w-full sm:h-[340px]">
          <PeacockHeroScene />
        </div>
        <div className="-mt-4 max-w-2xl space-y-5 sm:-mt-6">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Every vendor your event needs, curated into one beautiful display
          </h1>
          <p className="text-lg text-muted-foreground">
            Answer a few questions and Nkwado matches you with vetted caterers, venues, DJs,
            photographers and more — quoted within 24 hours, booked with confidence.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">Start planning</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/register">I&apos;m a vendor</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">How it works</h2>
          <p className="text-muted-foreground">
            From idea to booked event in five simple steps.
          </p>
        </div>
        <div className="h-[360px] sm:h-[420px]">
          <JourneyScene steps={JOURNEY_STEPS} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            One display, every color of vendor
          </h2>
          <p className="text-muted-foreground">
            Like a peacock&apos;s feathers, every vendor category comes together for your event.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {CATEGORY_CARDS.map((card) => (
            <TiltCard key={card.title} title={card.title} gradient={card.gradient} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold sm:text-3xl">
          Planning a {EVENT_TYPE_LABELS.WEDDING.toLowerCase()}, {EVENT_TYPE_LABELS.BIRTHDAY.toLowerCase()}, or something else?
        </h2>
        <p className="mt-2 text-muted-foreground">
          Nkwado handles it all — from intimate gatherings to large celebrations.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/register">Plan my event</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/register">Become a vendor</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t px-4 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Nkwado. All rights reserved.
      </footer>
    </div>
  );
}
