/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_APP_NAME: 'OCR Config Studio',
  },
  // Disable static page generation for dynamic content
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;

