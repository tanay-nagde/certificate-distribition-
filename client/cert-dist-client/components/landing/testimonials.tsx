import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Training Manager at TechCorp",
    content:
      "CertGen saved us hours of manual work. We generated 500 certificates for our annual training program in just minutes!",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Event Organizer",
    content:
      "The template customization is fantastic. Our certificates look professional and match our brand perfectly.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "HR Director",
    content: "Easy to use, reliable, and the customer support is excellent. Highly recommend for any organization.",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Loved by thousands of users
          </h2>
          <p className="text-lg text-muted-foreground">See what our customers are saying about CertGen.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="mb-4 flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 text-muted-foreground">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
