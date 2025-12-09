import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages deployment
  output: 'export',

  // Base path for GitHub Pages (replace 'metahuristicas' with your repo name)
  // Uncomment and modify if deploying to GitHub Pages subdirectory
  // basePath: '/metahuristicas',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Trailing slash for better GitHub Pages compatibility
  trailingSlash: true,
};

export default nextConfig;
