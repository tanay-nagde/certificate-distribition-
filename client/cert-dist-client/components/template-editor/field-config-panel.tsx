"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlignCenter, AlignLeft, AlignRight, Plus } from "lucide-react"

interface Field {
  id: string
  name: string
  x: number
  y: number
  fontSize: number
  fontFamily: string
  color: string
  align: "left" | "center" | "right"
}

export function FieldConfigPanel() {
  const [fields, setFields] = useState<Field[]>([
    {
      id: "name",
      name: "Name",
      x: 250,
      y: 180,
      fontSize: 24,
      fontFamily: "serif",
      color: "#000000",
      align: "center",
    },
    {
      id: "course",
      name: "Course",
      x: 200,
      y: 250,
      fontSize: 18,
      fontFamily: "sans-serif",
      color: "#333333",
      align: "center",
    },
    {
      id: "date",
      name: "Date",
      x: 350,
      y: 350,
      fontSize: 14,
      fontFamily: "sans-serif",
      color: "#555555",
      align: "right",
    },
  ])

  const [activeField, setActiveField] = useState<string>("name")

  const currentField = fields.find((field) => field.id === activeField)

  const handleFieldChange = (id: string, key: keyof Field, value: any) => {
    setFields(fields.map((field) => (field.id === id ? { ...field, [key]: value } : field)))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Field Configuration</h2>
        <p className="text-sm text-muted-foreground">Configure the appearance and position of text fields</p>
      </div>

      <Tabs value={activeField} onValueChange={setActiveField}>
        <TabsList className="w-full">
          {fields.map((field) => (
            <TabsTrigger key={field.id} value={field.id} className="flex-1">
              {field.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {fields.map((field) => (
          <TabsContent key={field.id} value={field.id} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${field.id}-x`}>X Position</Label>
                <Input
                  id={`${field.id}-x`}
                  type="number"
                  value={field.x}
                  onChange={(e) => handleFieldChange(field.id, "x", Number.parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${field.id}-y`}>Y Position</Label>
                <Input
                  id={`${field.id}-y`}
                  type="number"
                  value={field.y}
                  onChange={(e) => handleFieldChange(field.id, "y", Number.parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${field.id}-font-size`}>Font Size</Label>
              <Input
                id={`${field.id}-font-size`}
                type="number"
                value={field.fontSize}
                onChange={(e) => handleFieldChange(field.id, "fontSize", Number.parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${field.id}-font-family`}>Font Family</Label>
              <Select
                value={field.fontFamily}
                onValueChange={(value) => handleFieldChange(field.id, "fontFamily", value)}
              >
                <SelectTrigger id={`${field.id}-font-family`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="sans-serif">Sans Serif</SelectItem>
                  <SelectItem value="monospace">Monospace</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${field.id}-color`}>Text Color</Label>
              <div className="flex gap-2">
                <Input
                  id={`${field.id}-color`}
                  type="color"
                  value={field.color}
                  onChange={(e) => handleFieldChange(field.id, "color", e.target.value)}
                  className="w-12 p-1"
                />
                <Input
                  type="text"
                  value={field.color}
                  onChange={(e) => handleFieldChange(field.id, "color", e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Text Alignment</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={field.align === "left" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => handleFieldChange(field.id, "align", "left")}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={field.align === "center" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => handleFieldChange(field.id, "align", "center")}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={field.align === "right" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => handleFieldChange(field.id, "align", "right")}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Button className="w-full bg-transparent" variant="outline">
        <Plus className="mr-2 h-4 w-4" />
        Add New Field
      </Button>
    </div>
  )
}
