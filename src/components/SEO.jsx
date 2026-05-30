import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, image, url }) {
  const siteName = 'Johjay Foods';
  const defaultDescription = 'Johjay Foods — professional catering, event bookings, cakes, small chops, cocktails, and curated menus for memorable occasions.';
  const defaultImage = '/og-image.jpg'; // Add this image to public folder
  const siteUrl = 'https://johjayfoods.com'; // Update with actual domain

  return (
    <Helmet>
      <title>{title ? `${title} | ${siteName}` : siteName}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content="catering, event catering, cakes, small chops, cocktails, corporate catering, catering packages" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url || siteUrl} />
      <meta property="og:title" content={title ? `${title} | ${siteName}` : siteName} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || `${siteUrl}${defaultImage}`} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url || siteUrl} />
      <meta property="twitter:title" content={title ? `${title} | ${siteName}` : siteName} />
      <meta property="twitter:description" content={description || defaultDescription} />
      <meta property="twitter:image" content={image || `${siteUrl}${defaultImage}`} />

      {/* Additional meta tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#1a1a1a" />
      <link rel="canonical" href={url || siteUrl} />
    </Helmet>
  );
}