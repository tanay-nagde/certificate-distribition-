import { Upload, Edit, Download } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "Upload Your Data",
    description:
      "Upload a CSV file with recipient names, course details, and any other information you want on the certificates.",
  },
  {
    icon: Edit,
    title: "Customize Template",
    description:
      "Choose from our professional templates or create your own. Drag and drop text fields to position them perfectly.",
  },
  {
    icon: Download,
    title: "Generate & Download",
    description:
      "Click generate and download all your certificates as a ZIP file. Each certificate is personalized automatically.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">How it works</h2>
          <p className="text-lg text-muted-foreground">Create professional certificates in just three simple steps.</p>
        </div>

        <div className="grid gap-12 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <step.icon className="h-8 w-8" />
              </div>
              <div className="mb-4 text-sm font-semibold text-primary">STEP {index + 1}</div>
              <h3 className="mb-4 text-xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
