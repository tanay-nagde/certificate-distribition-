"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SelectTemplate() {
  const [template, setTemplate] = useState("")

  return (
    <div className="space-y-4">
      <Select value={template} onValueChange={setTemplate}>
        <SelectTrigger>
          <SelectValue placeholder="Select a template" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="certificate-of-completion">Certificate of Completion</SelectItem>
          <SelectItem value="certificate-of-achievement">Certificate of Achievement</SelectItem>
          <SelectItem value="certificate-of-excellence">Certificate of Excellence</SelectItem>
        </SelectContent>
      </Select>

      <Button asChild className="w-full">
        <Link href="/template-editor">New Template</Link>
      </Button>
    </div>
  )
}
