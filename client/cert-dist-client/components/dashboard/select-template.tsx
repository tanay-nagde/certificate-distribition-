"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDashboardStore } from "@/stores/dashboard.strore"
import { getTemplates } from "@/apis/parser"
import { CertificateTemplate } from "../../../../packages/types"

export function SelectTemplate() {
  const [currentTemplate, setCurrentTemplate] = useState<string>("")
  const setTemplateStore = useDashboardStore((state) => state.setTemplate)
  const [templates, setTemplates] = useState<CertificateTemplate[]>([])

  // Fetch templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await getTemplates()
        setTemplates(res.templates || [])
      } catch (error) {
        console.error("Error fetching templates:", error)
      }
    }
    fetchTemplates()
  }, [])

  // Update the store whenever currentTemplate changes
  useEffect(() => {
    if (currentTemplate) {
      setTemplateStore(currentTemplate)
    }
  }, [currentTemplate, setTemplateStore])

  return (
    <div className="space-y-4">
      <Select value={currentTemplate} onValueChange={setCurrentTemplate}>
        <SelectTrigger>
          <SelectValue placeholder="Select a template" />
        </SelectTrigger>
        <SelectContent>
          {templates.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button asChild className="w-full">
        <Link href="/template-editor">New Template</Link>
      </Button>
    </div>
  )
}
