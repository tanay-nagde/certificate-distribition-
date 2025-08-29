"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Canvas, FabricImage, Textbox } from "fabric"
import { Button } from "@/components/ui/button"
import { PanelRightOpen, PanelRightClose } from "lucide-react"

// Extend Fabric.js types to include fieldId
declare module "fabric" {
  interface FabricObject {
    fieldId?: string
    name?: string
  }
  interface Textbox {
    fontSize: number
  }
}

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

export interface RelativePosition {
  fieldId: string
  name: string
  relativeX: number
  relativeY: number
}

interface CertificatePreviewProps {
  showPanel: boolean
  onTogglePanel: () => void
  fields: Field[]
  setFields: React.Dispatch<React.SetStateAction<Field[]>>
  uploadedImage: File | null
  activeField: string
  setRelativePositions: React.Dispatch<React.SetStateAction<RelativePosition[]>>
  setActiveField: (id: string) => void
}

export function CertificatePreview({ 
  showPanel, 
  onTogglePanel, 
  fields, 
  setFields, 
  uploadedImage,
  activeField,
  setActiveField,
  setRelativePositions
}: CertificatePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fabricCanvasRef = useRef<Canvas | null>(null)
  
  // State to store relative positions of all fields


  // Modular debounce function
  const debounce = useCallback((func: Function, delay: number) => {
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
    
    return (...args: any[]) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
      debounceTimeout.current = setTimeout(() => func(...args), delay)
    }
  }, [])

  // Function to calculate and update relative positions
  const calculateRelativePositions = useCallback((fabricObj: any) => {
    if (!fabricObj.fieldId) return

    const backgroundImg = fabricCanvasRef.current?.getObjects().find(obj => obj.name === 'background-image')
    
    if (backgroundImg) {
      // Calculate position relative to image
      const imgLeft = backgroundImg.left || 0
      const imgTop = backgroundImg.top || 0
      const imgWidth = (backgroundImg.width || 1) * (backgroundImg.scaleX || 1)
      const imgHeight = (backgroundImg.height || 1) * (backgroundImg.scaleY || 1)
      
      // Convert to percentage coordinates relative to image
      const relativeX = ((fabricObj.left - imgLeft) / imgWidth) * 100
      const relativeY = ((fabricObj.top - imgTop) / imgHeight) * 100
      console.log("fabric obj ", fabricObj)
  
const fieldName =  "Unknown Field"

      const newRelativePosition: RelativePosition = {
        fieldId: fabricObj.fieldId,
        name: fieldName,
        relativeX: parseFloat(relativeX.toFixed(2)),
        relativeY: parseFloat(relativeY.toFixed(2))
      }

      // Update relative positions state
      setRelativePositions(prev => {
        const updated = prev.filter(pos => pos.fieldId !== fabricObj.fieldId)
        const newArray = [...updated, newRelativePosition]
        
        // Console log the updated array
        // console.log('Updated Relative Positions:', newArray)
        
        return newArray
      })
    }
  }, [fields])

  // Debounced version of the relative positions update
  const debouncedUpdateRelativePositions = useCallback(
    debounce(calculateRelativePositions, 300),
    [calculateRelativePositions]
  )

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return

    // Create Fabric.js canvas
    const fabricCanvas = new Canvas(canvasEl, {
      selection: true,
      width: canvasRef.current?.parentElement?.clientWidth || 800,
      height: canvasRef.current?.parentElement?.clientHeight || 600,
    })
    fabricCanvasRef.current = fabricCanvas

    // Load uploaded image if available
    if (uploadedImage) {
      const imageUrl = URL.createObjectURL(uploadedImage)
      loadBackgroundImage(fabricCanvas, imageUrl)
    }

    // Add existing text fields to canvas - always add fields when canvas is created
    fields.forEach(field => {
      addTextFieldToCanvas(field, fabricCanvas)
    })

    // Event handlers
    fabricCanvas.on("selection:created", (e) => {
      const activeObject = fabricCanvas.getActiveObject() 
      if (activeObject && activeObject.fieldId) {
        setActiveField(activeObject.fieldId)
        updateFieldFromFabricObject(activeObject)
        debouncedUpdateRelativePositions(activeObject)
      }
    })

    fabricCanvas.on("selection:updated", (e) => {
      const activeObject = fabricCanvas.getActiveObject()
      if (activeObject && activeObject.fieldId) {
        setActiveField(activeObject.fieldId)
        updateFieldFromFabricObject(activeObject)
        debouncedUpdateRelativePositions(activeObject)
      }
    })

    fabricCanvas.on("object:modified", (e) => {
      const obj = e.target
      if (obj && obj.fieldId) {
        updateFieldFromFabricObject(obj)
        debouncedUpdateRelativePositions(obj)
      }
    })

    fabricCanvas.on("object:moving", (e) => {
      const obj = e.target
      if (obj && obj.fieldId) {
        updateFieldFromFabricObject(obj)
        debouncedUpdateRelativePositions(obj)
      }
    })

    fabricCanvas.on("object:scaling", (e) => {
      const obj = e.target
      if (obj && obj.fieldId) {
        // Update font size based on scale
        const newFontSize = Math.round((obj as any).fontSize * (obj.scaleY || 1))
        obj.set({
          fontSize: newFontSize,
          scaleX: 1,
          scaleY: 1
        })
        updateFieldFromFabricObject(obj)
        debouncedUpdateRelativePositions(obj)
      }
    })

    return () => {
      fabricCanvas.dispose()
    }
  }, [uploadedImage ])

  // resize - under work

  // Load background image
  const loadBackgroundImage = async (canvas: Canvas, imageUrl: string) => {
    try {
      const img = await FabricImage.fromURL(imageUrl)
      
      // Scale image to fit canvas
      const canvasWidth = canvas.width!
      const canvasHeight = canvas.height!
      const scaleX = canvasWidth / img.width!
      const scaleY = canvasHeight / img.height!
      const scale = Math.min(scaleX, scaleY, 1) // Don't upscale

      img.set({
        scaleX: scale,
        scaleY: scale,
        left: (canvasWidth - img.width! * scale) / 2,
        top: (canvasHeight - img.height! * scale) / 2,
        selectable: false,
        evented: false,
        name: 'background-image'
      })

      canvas.add(img)
      canvas.sendObjectToBack(img)
      canvas.renderAll()
    } catch (error) {
      console.error('Error loading background image:', error)
    }
  }

  // Add text field to canvas
  const addTextFieldToCanvas = (field: Field, canvas: Canvas) => {
    const textbox = new Textbox(`enter your text here`, {
      left: field.x,
      top: field.y,
      name: field.name,
      fontSize: field.fontSize,
      fontFamily: field.fontFamily,
      fill: field.color,
      textAlign: field.align,
      fieldId: field.id,
      width: 200,
      editable: true,
      cornerColor: '#4F46E5',
      cornerSize: 8,
      transparentCorners: false,
      borderColor: '#4F46E5',
      borderScaleFactor: 2
    })

    canvas.add(textbox)
    
    // Update field with fabric object reference
    setFields(prevFields => 
      prevFields.map(f => 
        f.id === field.id ? { ...f, fabricObject: textbox } : f
      )
    )

    canvas.renderAll()
  }

  // Update field coordinates from fabric object
  const updateFieldFromFabricObject = (fabricObj: any) => {
    if (!fabricObj.fieldId) return

    // Update field state
    setFields(prevFields => 
      prevFields.map(field => 
        field.id === fabricObj.fieldId 
          ? {
              ...field,
              x: Math.round(fabricObj.left),
              y: Math.round(fabricObj.top),
              fontSize: fabricObj.fontSize,
              fabricObject: fabricObj
            }
          : field
      )
    )
  }

  // Add new fields to canvas when they are added to state
  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    fields.forEach(field => {
      if (!field.fabricObject) {
        addTextFieldToCanvas(field, canvas)
      }
    })
  }, [fields])

  // Update fabric objects when field properties change
  useEffect(() => {
    fields.forEach(field => {
      if (field.fabricObject) {
        field.fabricObject.set({
          fontSize: field.fontSize,
          fontFamily: field.fontFamily,
          fill: field.color,
          textAlign: field.align,
          left: field.x,
          top: field.y
        })
      }
    })
    fabricCanvasRef.current?.renderAll()
  }, [fields])

  // Highlight active field
  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas || !activeField) return

    const activeFieldObj = fields.find(f => f.id === activeField)
    if (activeFieldObj?.fabricObject) {
      canvas.setActiveObject(activeFieldObj.fabricObject)
      canvas.renderAll()
    }
  }, [activeField])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      // No need for timeout cleanup as debounce handles its own timeouts
    }
  }, [])

  return (
    <div className="flex flex-col items-center relative">
      <div className="  w-full  h-full rounded-lg border shadow-sm">
        <canvas 
          className="block border-2 border-amber-400" 
          ref={canvasRef}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      
      <p className="mt-4 text-sm text-muted-foreground">
        {uploadedImage 
          ? 'Drag text fields on the image. Positions are calculated relative to the image.' 
          : 'Upload an image to get started'
        }
      </p>

      {/* Floating Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={onTogglePanel}
        className="absolute top-4 right-4 z-20 shadow-lg"
        title={showPanel ? "Close Panel" : "Open Panel"}
      >
        {showPanel ? (
          <PanelRightClose className="h-5 w-5" />
        ) : (
          <PanelRightOpen className="h-5 w-5" />
        )}
      </Button>
    </div>
  )
}