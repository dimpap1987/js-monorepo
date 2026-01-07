'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@js-monorepo/components/ui/accordion'
import { cn } from '@js-monorepo/ui/util'
import { FAQItem } from '../../types'

interface PricingFAQProps {
  items?: FAQItem[]
  className?: string
}

const defaultFAQItems: FAQItem[] = [
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period, and you won't be charged again.",
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit and debit cards including Visa, Mastercard, American Express, and Discover. All payments are processed securely through Stripe.',
  },
  {
    question: 'Is there a free trial available?',
    answer:
      "We offer a free tier with limited features so you can explore the platform before committing to a paid plan. Upgrade anytime when you're ready for more.",
  },
  // {
  //   question: 'Can I change my plan later?',
  //   answer:
  //     "Absolutely! You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the change takes effect at your next billing cycle.",
  // },
  // {
  //   question: 'What happens to my data if I cancel?',
  //   answer:
  //     'Your data remains safe and accessible until the end of your billing period. After that, you can export your data or reactivate your subscription within 30 days to restore access.',
  // },
]

export function PricingFAQ({ items = defaultFAQItems, className }: PricingFAQProps) {
  return (
    <section className={cn('max-w-3xl mx-auto', className)}>
      <h2 className="text-2xl font-semibold text-foreground text-center mb-8">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        {items.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left text-foreground hover:text-foreground">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-foreground-neutral">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
