"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  CalendarCheck,
  Camera,
  Car,
  Flower2,
  HandCoins,
  Hotel,
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
import { Reveal } from "./Reveal";
import { TiltCard } from "./TiltCard";
import { EVENT_TYPE_LABELS } from "@/lib/types";

const PeacockScrollJourney = dynamic(
  () => import("@/components/three/PeacockScrollJourney").then((m) => m.PeacockScrollJourney),
  { ssr: false }
);

const JourneyScrollScene = dynamic(
  () => import("@/components/three/JourneyScrollScene").then((m) => m.JourneyScrollScene),
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
  image: string;
  icon: typeof UtensilsCrossed;
  size?: "sm" | "lg";
}[] = [
  {
    title: "Catering",
    subtitle: "Buffet, plated, or small chops",
    gradient: "bg-gradient-to-br from-amber-600 to-amber-400",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=70&auto=format&fit=crop",
    icon: UtensilsCrossed,
    size: "lg",
  },
  {
    title: "Venue",
    subtitle: "Halls, gardens, and rooftops",
    gradient: "bg-gradient-to-br from-teal-700 to-teal-400",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900&q=70&auto=format&fit=crop",
    icon: Warehouse,
    size: "lg",
  },
  {
    title: "DJ",
    subtitle: "Sets the mood",
    gradient: "bg-gradient-to-br from-violet-700 to-violet-400",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=70&auto=format&fit=crop",
    icon: Music2,
  },
  {
    title: "Live Band",
    subtitle: "Live entertainment",
    gradient: "bg-gradient-to-br from-fuchsia-700 to-fuchsia-400",
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=70&auto=format&fit=crop",
    icon: Music2,
  },
  {
    title: "Photography",
    subtitle: "Every moment, captured",
    gradient: "bg-gradient-to-br from-blue-800 to-blue-500",
    image: "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=600&q=70&auto=format&fit=crop",
    icon: Camera,
  },
  {
    title: "Videography",
    subtitle: "Cinematic highlight reels",
    gradient: "bg-gradient-to-br from-cyan-700 to-cyan-400",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=70&auto=format&fit=crop",
    icon: Camera,
  },
  {
    title: "Decoration",
    subtitle: "Your theme, brought to life",
    gradient: "bg-gradient-to-br from-emerald-700 to-emerald-400",
    image: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&q=70&auto=format&fit=crop",
    icon: Sparkles,
  },
  {
    title: "Florist",
    subtitle: "Fresh arrangements",
    gradient: "bg-gradient-to-br from-rose-700 to-rose-400",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&q=70&auto=format&fit=crop",
    icon: Flower2,
  },
  {
    title: "Planner",
    subtitle: "Full-service coordination",
    gradient: "bg-gradient-to-br from-indigo-700 to-indigo-400",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=70&auto=format&fit=crop",
    icon: CalendarCheck,
  },
  {
    title: "Accommodation",
    subtitle: "Hotels and lodges for guests",
    gradient: "bg-gradient-to-br from-orange-700 to-orange-400",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=70&auto=format&fit=crop",
    icon: Hotel,
  },
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
  {
    icon: HandCoins,
    title: "Flexible financing, if you need it",
    description:
      "Don't let budget hold your event back. Spread the cost into monthly payments and get the vendors you actually want, not just the ones you can afford today.",
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
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
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
        </div>
      </header>

      {/* Hero: scroll-driven peacock journey */}
      <PeacockScrollJourney />

      {/* How it works: scroll-scrubbed journey path */}
      <JourneyScrollScene steps={JOURNEY_STEPS} />

      {/* Categories */}
      <section id="categories" className="mx-auto max-w-6xl px-4 py-16">
        <Reveal className="mb-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            One display, every color of vendor
          </h2>
          <p className="text-muted-foreground">
            A peacock never wins a mate with a single feather. It&apos;s the full fan that turns
            heads. Nkwado works the same way, bringing every vendor your event needs into one
            show-stopping display.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CATEGORY_CARDS.filter((c) => c.size === "lg").map((card, i) => (
            <Reveal key={card.title} delay={i * 120}>
              <TiltCard {...card} />
            </Reveal>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CATEGORY_CARDS.filter((c) => c.size !== "lg").map((card, i) => (
            <Reveal key={card.title} delay={(i % 4) * 100}>
              <TiltCard {...card} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why Nkwado: editorial split section */}
      <section id="why-nkwado" className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 sm:grid-cols-2 sm:items-center">
          <div>
            <Reveal>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Every event, perfectly planned
              </h2>
              <p className="mt-2 max-w-md text-muted-foreground">
                Built for the way events actually come together: many vendors, one plan, zero
                guesswork.
              </p>
            </Reveal>
            <div className="mt-8 space-y-6">
              {FEATURES.map((feature, i) => (
                <Reveal key={feature.title} delay={i * 110}>
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-medium">{feature.title}</p>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={150} className="h-full">
            <div className="relative h-full overflow-hidden rounded-[2rem] border bg-gradient-to-br from-primary/5 to-primary/10 p-8">
              <div className="flex h-full min-h-[320px] items-center justify-center">
                <PeacockMark className="h-40 w-40" animated />
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
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
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
        </Reveal>
      </section>

      <footer className="border-t px-4 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Nkwado. All rights reserved.
      </footer>
    </div>
  );
}
