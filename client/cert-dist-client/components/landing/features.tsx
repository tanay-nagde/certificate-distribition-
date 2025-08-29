import { FileSpreadsheet, Palette, Zap, Shield, Users, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: FileSpreadsheet,
    title: "CSV Upload",
    description: "Upload your recipient data via CSV and generate certificates for hundreds of people at once.",
  },
  {
    icon: Palette,
    title: "Custom Templates",
    description: "Design beautiful certificates with our drag-and-drop editor or choose from professional templates.",
  },
  {
    icon: Zap,
    title: "Instant Generation",
    description: "Generate hundreds of certificates in seconds with our high-performance processing engine.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Your data is encrypted and secure. We never store sensitive information longer than necessary.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work with your team to create and manage certificates. Share templates and collaborate seamlessly.",
  },
  {
    icon: Download,
    title: "Multiple Formats",
    description: "Download certificates as PDF, PNG, or JPEG. Perfect for printing or digital distribution.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Everything you need to create certificates
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed to make certificate creation fast, easy, and professional.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-none">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
