import { ContainerTemplate } from '@js-monorepo/templates'
import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '../lib/seo'
import { SITE_NAME } from '../lib/site-config'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Home',
  description: `Welcome to ${SITE_NAME} - Your fitness journey starts here.`,
  keywords: ['gym', 'fitness', 'workout', 'health', 'training'],
  type: 'website',
})

export default function HomePage() {
  return (
    <ContainerTemplate>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to {SITE_NAME}</h1>
        <p className="text-lg text-foreground-muted mb-8">Your fitness journey starts here</p>
        <div className="flex gap-4">
          <a
            href="/workouts"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Browse Workouts
          </a>
          <a
            href="/about"
            className="px-6 py-3 border border-border rounded-lg hover:bg-background-secondary transition-colors"
          >
            Learn More
          </a>
        </div>
      </div>
    </ContainerTemplate>
  )
}
