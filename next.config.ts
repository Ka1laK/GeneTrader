import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages deployment
  output: 'export',

  // Base path for GitHub Pages (set via environment variable)
  // For GitHub Pages: set NEXT_PUBLIC_BASE_PATH=/your-repo-name
  basePath: basePath,

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Trailing slash for better GitHub Pages compatibility
  trailingSlash: true,

  // Environment variables
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
