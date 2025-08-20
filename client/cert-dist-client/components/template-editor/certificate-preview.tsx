"use client"

import { useState } from "react"
import { Rnd } from "react-rnd"

interface FieldBox {
  id: string
  x: number
  y: number
  width: number
  height: number
  content: string
  fontSize: number
  fontFamily: string
  color: string
  align: "left" | "center" | "right"
}

export function CertificatePreview() {
  const [fields, setFields] = useState<FieldBox[]>([
    {
      id: "name",
      x: 250,
      y: 180,
      width: 300,
      height: 50,
      content: "[Name]",
      fontSize: 24,
      fontFamily: "serif",
      color: "#000000",
      align: "center",
    },
    {
      id: "course",
      x: 200,
      y: 250,
      width: 400,
      height: 40,
      content: "[Course Title]",
      fontSize: 18,
      fontFamily: "sans-serif",
      color: "#333333",
      align: "center",
    },
    {
      id: "date",
      x: 350,
      y: 350,
      width: 200,
      height: 30,
      content: "[Date]",
      fontSize: 14,
      fontFamily: "sans-serif",
      color: "#555555",
      align: "right",
    },
  ])

  return (
    <div className="flex flex-col items-center">
      <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-lg border shadow-sm">
        <div className="relative">
          <img src="/placeholder.svg?height=600&width=800" alt="Certificate Template" className="w-full" />

          {fields.map((field) => (
            <Rnd
              key={field.id}
              default={{
                x: field.x,
                y: field.y,
                width: field.width,
                height: field.height,
              }}
              bounds="parent"
              onDragStop={(e, d) => {
                const updatedFields = fields.map((f) => (f.id === field.id ? { ...f, x: d.x, y: d.y } : f))
                setFields(updatedFields)
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                const updatedFields = fields.map((f) =>
                  f.id === field.id
                    ? {
                        ...f,
                        width: Number.parseInt(ref.style.width),
                        height: Number.parseInt(ref.style.height),
                        x: position.x,
                        y: position.y,
                      }
                    : f,
                )
                setFields(updatedFields)
              }}
              className="border border-dashed border-primary bg-primary/10 hover:bg-primary/20"
            >
              <div
                className="flex h-full w-full items-center justify-center p-2"
                style={{
                  fontSize: `${field.fontSize}px`,
                  fontFamily: field.fontFamily,
                  color: field.color,
                  textAlign: field.align,
                }}
              >
                {field.content}
              </div>
            </Rnd>
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Drag and resize the text fields to position them on the certificate
      </p>
    </div>
  )
}
