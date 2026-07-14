"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressTracker } from "@/components/progress-tracker";
import { getProgress } from "@/lib/customer-api";

export default function ProgressPage() {
  const params = useParams<{ requestId: string }>();
  const requestId = params.requestId;

  const { data: progress, isLoading, isError } = useQuery({
    queryKey: ["customer-progress", requestId],
    queryFn: () => getProgress(requestId),
    enabled: Boolean(requestId),
  });

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Your event progress</h1>
        <p className="text-muted-foreground">Track where things stand with your booking.</p>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {isError && (
        <p className="text-sm text-destructive">Couldn&apos;t load your progress.</p>
      )}

      {progress && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current stage</CardTitle>
            <CardDescription>{progress.stage.replace(/_/g, " ")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressTracker steps={progress.steps} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
