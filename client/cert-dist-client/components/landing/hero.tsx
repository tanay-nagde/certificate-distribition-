"use client"

import Link from "next/link"
import { ArrowRight, Play, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6">
            🎉 Now with AI-powered templates
          </Badge>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Create Professional{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Certificates
            </span>{" "}
            in Minutes
          </h1>

          <p className="mb-8 text-lg text-muted-foreground sm:text-xl md:text-2xl max-w-3xl mx-auto">
            Generate beautiful, customizable certificates for your courses, events, and achievements. Upload your data,
            choose a template, and create hundreds of certificates instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/auth">
                Start Creating Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="ml-2">4.9/5 from 2,000+ users</span>
            </div>
            <div>✓ No credit card required</div>
            <div>✓ Free templates included</div>
          </div>
        </div>

        {/* Hero Image/Demo */}
        {/* <div className="mt-16 mx-auto max-w-5xl">
          <div className="relative rounded-xl border bg-background/50 p-2 shadow-2xl">
            <img
              src="/placeholder.svg?height=600&width=1000&text=Certificate+Generator+Dashboard"
              alt="Certificate Generator Dashboard"
              className="rounded-lg w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-xl" />
          </div>
        </div> */}
      </div>
    </section>
  )
}
