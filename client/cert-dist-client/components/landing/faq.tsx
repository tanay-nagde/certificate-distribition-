"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const faqs = [
  {
    question: "How many certificates can I generate?",
    answer:
      "It depends on your plan. The Free plan allows up to 50 certificates per month, Pro allows up to 1,000, and Enterprise has no limits.",
  },
  {
    question: "What file formats are supported for download?",
    answer:
      "You can download certificates as PDF (all plans), PNG, or JPEG (Pro and Enterprise plans). PDF is recommended for printing.",
  },
  {
    question: "Can I customize the certificate templates?",
    answer:
      "Yes! You can customize colors, fonts, positioning, and add your own logos. Pro and Enterprise plans offer advanced customization options.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use enterprise-grade encryption and never store your data longer than necessary. All uploads are automatically deleted after processing.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes, we offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, we'll refund your payment in full.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel your subscription at any time. You'll continue to have access to your plan features until the end of your billing period.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">Frequently asked questions</h2>
          <p className="text-lg text-muted-foreground">Everything you need to know about CertGen.</p>
        </div>

        <div className="mx-auto max-w-3xl space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardContent className="p-0">
                <button
                  className="flex w-full items-center justify-between p-6 text-left"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="font-semibold">{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 transition-transform ${openIndex === index ? "rotate-180" : ""}`} />
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-6">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
