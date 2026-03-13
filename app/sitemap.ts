import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://rankboast.com'

  // List of public routes
  const routes = [
    '',
    '/about',
    '/features',
    '/pricing',
    '/contact',
    '/terms',
    '/privacy',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }))
}
