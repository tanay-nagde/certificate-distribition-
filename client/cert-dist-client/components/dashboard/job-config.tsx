"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useDashboardStore } from "@/stores/dashboard.strore";
import { generateCert } from "@/apis/parser";

// optional: shadcn/ui Progress
import { Progress } from "@/components/ui/progress";

export function JobConfig() {
  const csvFile = useDashboardStore((state) => state.csvFile);
  const template = useDashboardStore((state) => state.template);

  const [emailNotifications, setEmailNotifications] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [currentName, setCurrentName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!csvFile) {
      alert("Please upload a CSV first");
      return;
    }

    try {
      setLoading(true);
      setProgress(0);
      setTotal(0);
      setCurrentName("");

      await generateCert(csvFile, template, (data) => {
        if (data?.progress && data?.total) {
          setProgress(data.progress);
          setTotal(data.total);
        }
        if (data?.data?.Name) {
          setCurrentName(data.data.Name);
        }
      });

      // When finished, reset after short delay
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Generation failed:", err);
      alert("Failed to start generation");
      setLoading(false);
    }
  };

  const percent = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="email-toggle" className="text-sm">
            Send emails after generation
          </Label>
          <Switch
            checked={emailNotifications}
            id="email-toggle"
            onCheckedChange={setEmailNotifications}
          />
        </div>
      </div>

      <div className="space-y-2 rounded-lg bg-muted p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Records:</span>
          <span className="font-medium">{total || "—"}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress:</span>
          <span className="font-medium">
            {progress}/{total || "?"}
          </span>
        </div>
      </div>

      <Button onClick={handleStart} disabled={loading} className="w-full">
        {loading ? "Generating..." : "Start Generation"}
      </Button>

      {/* Progress Bar */}
      {loading && total > 0 && (
        <div className="mt-4 space-y-2">
          <Progress value={percent} className="w-full" />
          <div className="text-sm text-muted-foreground">
            {percent}% — Processing <b>{currentName}</b>
          </div>
        </div>
      )}
    </div>
  );
}
