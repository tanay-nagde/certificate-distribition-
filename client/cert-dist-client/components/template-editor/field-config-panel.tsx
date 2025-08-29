"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Plus, Trash2, AlignLeft, AlignCenter, AlignRight } from "lucide-react"

export interface Field {
  id: string
  name: string
  x: number
  y: number
  fontSize: number
  fontFamily: string
  color: string
  align: "left" | "center" | "right"
  fabricObject?: any
}

interface FieldConfigPanelProps {
  fields: Field[]
  activeField: string
  setActiveField: (id: string) => void
  handleFieldChange: (id: string, key: keyof Field, value: any) => void
  addNewField: () => void
  removeField: (id: string) => void
  uploadedImage: File | null
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function FieldConfigPanel({
  fields,
  activeField,
  setActiveField,
  handleFieldChange,
  addNewField,
  removeField,
  uploadedImage,
  handleImageUpload
}: FieldConfigPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const currentField = fields.find(field => field.id === activeField)

  const fontOptions = [
    "Arial",
    "Times New Roman",
    "Helvetica",
    "Georgia",
    "Verdana",
    "Courier New",
    "Impact",
    "Comic Sans MS",
    "Trebuchet MS",
    "Palatino",
    "serif",
    "sans-serif",
    "monospace"
  ]

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      <div>
        <h2 className="text-lg font-medium">Field Configuration</h2>
        <p className="text-sm text-muted-foreground">Configure text fields on your certificate</p>
      </div>

      {/* Image Upload Section */}
      <div className="space-y-2">
        <Label>Background Image</Label>
        <div className="flex gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploadedImage ? 'Change Image' : 'Upload Image'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        {uploadedImage && (
          <div className="text-xs text-green-600 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Image uploaded successfully
          </div>
        )}
      </div>

      {/* Add New Field Button */}
      <Button onClick={addNewField} variant="outline" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Text Field
      </Button>

      {/* Field List */}
      {fields.length > 0 && (
        <div className="space-y-2">
          <Label>Text Fields ({fields.length})</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {fields.map(field => (
              <div
                key={field.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                  activeField === field.id 
                    ? 'border-blue-500 bg-blue-50 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setActiveField(field.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="font-medium text-sm">{field.name}</span>
                    <div className="text-xs text-gray-500 mt-1">
                      Position: ({field.x}, {field.y}) • Size: {field.fontSize}px
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeField(field.id)
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Field Configuration */}
      {currentField && (
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <h3 className="font-medium">Edit Field: {currentField.name}</h3>
          </div>
          
          {/* Field Name */}
          <div className="space-y-2">
            <Label htmlFor="field-name">Field Name</Label>
            <Input
              id="field-name"
              value={currentField.name}
              onChange={(e) => handleFieldChange(currentField.id, "name", e.target.value)}
              placeholder="Enter field name"
            />
          </div>

          {/* Position */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="field-x">X Position</Label>
              <Input
                id="field-x"
                type="number"
                value={currentField.x}
                onChange={(e) => handleFieldChange(currentField.id, "x", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="field-y">Y Position</Label>
              <Input
                id="field-y"
                type="number"
                value={currentField.y}
                onChange={(e) => handleFieldChange(currentField.id, "y", Number(e.target.value))}
              />
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <Label htmlFor="field-font-size">Font Size</Label>
            <Input
              id="field-font-size"
              type="number"
              min="8"
              max="200"
              value={currentField.fontSize}
              onChange={(e) => handleFieldChange(currentField.id, "fontSize", Number(e.target.value))}
            />
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <Label htmlFor="field-font-family">Font Family</Label>
            <Select
              value={currentField.fontFamily}
              onValueChange={(value) => handleFieldChange(currentField.id, "fontFamily", value)}
            >
              <SelectTrigger id="field-font-family">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                {fontOptions.map((font) => (
                  <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Text Color */}
          <div className="space-y-2">
            <Label htmlFor="field-color">Text Color</Label>
            <div className="flex gap-2">
              <Input
                id="field-color"
                type="color"
                value={currentField.color}
                onChange={(e) => handleFieldChange(currentField.id, "color", e.target.value)}
                className="w-12 p-1 h-10"
              />
              <Input
                type="text"
                value={currentField.color}
                onChange={(e) => handleFieldChange(currentField.id, "color", e.target.value)}
                className="flex-1"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Text Alignment */}
          <div className="space-y-2">
            <Label>Text Alignment</Label>
            <div className="flex gap-1">
              <Button
                type="button"
                variant={currentField.align === "left" ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleFieldChange(currentField.id, "align", "left")}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={currentField.align === "center" ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleFieldChange(currentField.id, "align", "center")}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={currentField.align === "right" ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleFieldChange(currentField.id, "align", "right")}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Field Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600">
              <div><strong>ID:</strong> {currentField.id}</div>
              <div><strong>Type:</strong> Text Field</div>
              <div><strong>Canvas Object:</strong> {currentField.fabricObject ? '✓ Connected' : '✗ Not Connected'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {fields.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="text-gray-400 mb-2">
            <Plus className="h-8 w-8 mx-auto" />
          </div>
          <p className="text-sm text-gray-500 mb-2">No text fields added yet</p>
          <p className="text-xs text-gray-400">Click "Add Text Field" to get started</p>
        </div>
      )}
    </div>
  )
}