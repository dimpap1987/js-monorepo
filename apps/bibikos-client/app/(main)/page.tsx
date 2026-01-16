import { generateMetadata } from '@js-monorepo/seo'
import { ContainerTemplate } from '@js-monorepo/templates'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next/types'
import { AppConfig } from '../../lib/app-config'

export const metadata: Metadata = generateMetadata({
  title: 'Home',
  description: `Welcome to ${AppConfig.appName} - A modern web application built with Next.js. Discover our features, pricing, and more.`,
})

export default async function HomePage() {
  const t = await getTranslations('home')
  const tCommon = await getTranslations('common')

  return <ContainerTemplate></ContainerTemplate>
}
