import { MetadataRoute } from 'next'
import { SITE_URL } from '../lib/site-config'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/pricing', '/feedback', '/privacy-cookie-statement', '/terms-of-use']

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.8,
  }))
}
