interface PricingHeroProps {
  title: string
  subtitle: string
  className?: string
}

export function PricingHero({ title, subtitle, className }: PricingHeroProps) {
  return (
    <section className={className}>
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-4 text-lg text-foreground-neutral leading-relaxed">{subtitle}</p>
      </div>
    </section>
  )
}
