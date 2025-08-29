"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { CertificatePreview, RelativePosition } from "@/components/template-editor/certificate-preview"
import { FieldConfigPanel } from "@/components/template-editor/field-config-panel"
import { TemplateEditorHeader } from "@/components/template-editor/template-editor-header"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ZoomIn, ZoomOut, RotateCcw, Clock } from "lucide-react"
import { uploadTemp } from "@/apis/parser"
import { getme } from "@/apis/auth"
import { useRouter } from "next/navigation"

// Field interface
export interface Field {
  id: string
  name: string
  x: number
  y: number
  fontSize: number
  fontFamily: string
  color: string
  align: "left" | "center" | "right"
  fabricObject?: any // Reference to fabric object
}

export default function TemplateEditor() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [showPanel, setShowPanel] = useState(true)
  const [zoom, setZoom] = useState(100)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Lifted states
  const [fields, setFields] = useState<Field[]>([])
  const [activeField, setActiveField] = useState<string>("")
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [relativePositions, setRelativePositions] = useState<RelativePosition[]>([])
  const [templateName , setTemplateName] = useState("")
//auth
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await getme()
        if (!u) {
          router.push("/auth")  // redirect if not logged in
        } else {
         
          console.log("User fetched:", u.data)
        }
      } catch (err) {
        router.push("/auth")
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [router])
  // Initialize client-side only state and time
  useEffect(() => {
    setIsClient(true)
    setCurrentTime(new Date())
  }, [])

  // Update time every minute (only on client)
  useEffect(() => {
    if (!isClient) return
    
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [isClient])

  console.log("Fields:", fields)
  console.log("Relative Positions:", relativePositions)

  const handleTogglePanel = () => {
    setShowPanel(!showPanel)
  }

  const handleZoomChange = useCallback((value: number[]) => {
    setZoom(value[0])
  }, [])

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 25))
  }

  const handleResetZoom = () => {
    setZoom(100)
  }

  const handleFieldChange = (id: string, key: keyof Field, value: any) => {
    setFields(fields.map((field) => {
      if (field.id === id) {
        const updatedField = { ...field, [key]: value }

        // Update fabric object if it exists
        if (field.fabricObject) {
          if (key === "fontSize") {
            field.fabricObject.set("fontSize", value)
          } else if (key === "fontFamily") {
            field.fabricObject.set("fontFamily", value)
          } else if (key === "color") {
            field.fabricObject.set("fill", value)
          } else if (key === "align") {
            field.fabricObject.set("textAlign", value)
          } else if (key === "x") {
            field.fabricObject.set("left", value)
          } else if (key === "y") {
            field.fabricObject.set("top", value)
          }

          field.fabricObject.canvas?.renderAll()
        }

        return updatedField
      }
      return field
    }))
  }

  const addNewField = () => {
    const newId = uuidv4()
    const newField: Field = {
      id: newId,
      name: `Field_${fields.length + 1}`,
      x: 100 + fields.length * 20,
      y: 100 + fields.length * 20,
      fontSize: 16,
      fontFamily: "Arial",
      color: "#000000",
      align: "left",
    }
    setFields([...fields, newField])
    setActiveField(newId)
  }

  const removeField = (id: string) => {
    const field = fields.find(f => f.id === id)

    // Remove from fabric canvas
    if (field?.fabricObject && field.fabricObject.canvas) {
      field.fabricObject.canvas.remove(field.fabricObject)
    }

    const filtered = fields.filter((field) => field.id !== id)
    setFields(filtered)
    if (activeField === id && filtered.length > 0) {
      setActiveField(filtered[0].id)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedImage(file)
    }
  }

  // Build payload exactly as controller expects
  const buildPayload = (title: string) => {
    return {
      title,
    
      fields: fields.map(field => {
        const relPos = relativePositions.find(r => r.fieldId === field.id)
        return {
          field_key: field.name,
          x: Math.round(relPos?.relativeX ?? field.x),
          y: Math.round(relPos?.relativeY ?? field.y),
          font_size: field.fontSize,
          color: field.color,
          font: field.fontFamily,
          text_align: field.align
        }
      })
    }
  }

  const handleSave = async () => {
    try {
      const payload = buildPayload(templateName)
      const response = await uploadTemp(uploadedImage, payload)

      console.log("API response:", response)
      alert("Template saved successfully!")
    } catch (error) {
      console.error("Error saving template:", error)
    }
  }

  return (
    <>
    {
      loading ? (
        <div className="p-6">Loading...</div>
      ) : (
       <div className="flex min-h-screen flex-col bg-background">
      {/* Fixed Header - Not zoomable */}
      <div className="relative z-50">
        <TemplateEditorHeader handleSave={handleSave} templateName={templateName} setTemplateName={setTemplateName  } />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Fixed Config Panel - Highest z-index, not zoomable */}
        <div 
          className={`fixed top-16 left-0 bottom-16 w-96 bg-card border-r shadow-lg transition-transform duration-300 ease-in-out z-40 ${
            showPanel ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full overflow-auto p-4">
            <FieldConfigPanel 
              fields={fields}
              activeField={activeField}
              setActiveField={setActiveField}
              handleFieldChange={handleFieldChange}
              addNewField={addNewField}
              removeField={removeField}
              uploadedImage={uploadedImage}
              handleImageUpload={handleImageUpload}
            />
          </div>
        </div>

        {/* Center Canvas Area - Zoomable */}
        <div 
          className={`flex-1 overflow-hidden transition-all duration-300 ease-in-out ${
            showPanel ? 'ml-96' : 'ml-0'
          }`}
          style={{ marginBottom: '64px' }} // Space for bottom panel
        >
          <div 
            className="w-full h-full flex items-center justify-center p-8 overflow-auto"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center',
            }}
          >
            <div className="max-w-4xl w-full">
              <CertificatePreview 
                showPanel={showPanel} 
                onTogglePanel={handleTogglePanel}
                fields={fields}
                setRelativePositions={setRelativePositions}
                setFields={setFields}
                uploadedImage={uploadedImage}
                activeField={activeField}
                setActiveField={setActiveField}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Panel - Not zoomable */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t shadow-lg z-50">
        <div className="flex items-center justify-between h-full px-6">
          {/* Left side - Zoom controls */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 25}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium w-12">{zoom}%</span>
              <Slider
                value={[zoom]}
                onValueChange={handleZoomChange}
                max={200}
                min={25}
                step={5}
                className="w-32"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetZoom}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Center - Additional controls can go here */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Fields: {fields.length}
            </span>
          </div>

          {/* Right side - Time */}
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {isClient && currentTime 
                ? currentTime.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
                : '--:--'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
      )
    }
    
    </>
  )
}