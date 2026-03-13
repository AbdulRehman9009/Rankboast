import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/auth/',
        '/(protectedRoutes)/',
        '/admin/',
        '/profile/',
      ],
    },
    sitemap: 'https://rankboast.com/sitemap.xml',
  }
}
