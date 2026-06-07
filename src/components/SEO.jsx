import React from "react";
import { Helmet } from "react-helmet-async";
import { SITE_INFO } from "../constants/siteInfo";

/**
 * Reusable SEO component using react-helmet-async
 * @param {string} title - The page title
 * @param {string} description - The meta description
 * @param {string} keywords - The meta keywords comma-separated
 * @param {string} image - The open graph image URL
 * @param {string} url - The canonical URL path
 */
const SEO = ({ title, description, keywords, image, url }) => {
  const defaultTitle = SITE_INFO.name;
  const displayTitle = title ? `${title} | ${SITE_INFO.shortName}` : defaultTitle;
  const displayDesc = description || SITE_INFO.description;
  const displayKeywords = keywords || SITE_INFO.keywords;
  const displayImage = image || SITE_INFO.ogImage;
  const displayUrl = `${SITE_INFO.siteUrl}${url || ""}`;

  return (
    <Helmet>
      {/* Title */}
      <title>{displayTitle}</title>
      
      {/* General Meta */}
      <meta name="description" content={displayDesc} />
      <meta name="keywords" content={displayKeywords} />
      <link rel="canonical" href={displayUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={displayTitle} />
      <meta property="og:description" content={displayDesc} />
      <meta property="og:image" content={displayImage} />
      <meta property="og:url" content={displayUrl} />
      <meta property="og:site_name" content={SITE_INFO.shortName} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={displayTitle} />
      <meta name="twitter:description" content={displayDesc} />
      <meta name="twitter:image" content={displayImage} />
    </Helmet>
  );
};

export default SEO;
