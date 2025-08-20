"use client"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function JobConfig() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="email-toggle" className="text-sm">
            Send emails after generation
          </Label>
          <Switch id="email-toggle" />
        </div>
      </div>

      <div className="space-y-2 rounded-lg bg-muted p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Records:</span>
          <span className="font-medium">327</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Estimated time:</span>
          <span className="font-medium">1.2 mins</span>
        </div>
      </div>

      <Button className="w-full">Start Generation</Button>
    </div>
  )
}
