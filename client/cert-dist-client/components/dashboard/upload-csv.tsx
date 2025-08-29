"use client"

import type React from "react"

import { use, useEffect, useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDashboardStore } from "@/stores/dashboard.strore"

export function UploadCSV() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const setCsvFile = useDashboardStore((state) => (state.setCsvFile))
  //set file in state when file chanegs
  useEffect(() => {
    setCsvFile(file)
  }, [file, setCsvFile])
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-muted"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
        <p className="mb-1 text-sm font-medium">Drag and drop your CSV file here</p>
        <p className="mb-4 text-xs text-muted-foreground">or</p>
        <Button variant="outline" size="sm" onClick={() => document.getElementById("csv-upload")?.click()}>
          Browse Files
        </Button>
        <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
      </div>

      {file && (
        <div className="rounded-lg border bg-card p-3 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">327 entries</p>
            </div>
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
