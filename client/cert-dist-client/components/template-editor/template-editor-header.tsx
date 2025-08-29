"use client"

import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
interface props{
  handleSave:()=>void
  templateName: string
  setTemplateName: (name: string) => void
}

export function TemplateEditorHeader({ handleSave, templateName, setTemplateName }: props) {
  return (
    <header className="border-b w-full">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-4 md:px-6 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to dashboard</span>
            </Link>
          </Button>

          <Input
            className="h-9 w-full sm:w-[200px] md:w-[300px] flex-shrink"
            placeholder="Template Name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
        
          <Button onClick={handleSave} className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            Save Template
          </Button>
        </div>
      </div>
    </header>
  )
}
