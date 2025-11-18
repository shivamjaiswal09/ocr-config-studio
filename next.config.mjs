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
  // Only use app directory, ignore pages directory in src
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // Exclude src directory and vite config from build (old structure files)
  webpack: (config, { isServer }) => {
    // Ignore src directory and vite config files
    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      include: (filePath) => {
        const normalizedPath = filePath.replace(/\\/g, '/');
        const isSrcFile = normalizedPath.includes('/src/') && !normalizedPath.includes('node_modules');
        const isViteConfig = normalizedPath.endsWith('vite.config.ts') && !normalizedPath.includes('node_modules');
        return isSrcFile || isViteConfig;
      },
      use: {
        loader: 'null-loader',
      },
    });
    
    // Also exclude from entry points
    if (config.entry && typeof config.entry === 'function') {
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        if (typeof entries === 'object' && entries !== null) {
          Object.keys(entries).forEach((key) => {
            if (Array.isArray(entries[key])) {
              entries[key] = entries[key].filter((entry) => {
                const normalized = entry.replace(/\\/g, '/');
                return !normalized.includes('/src/') && !normalized.endsWith('vite.config.ts');
              });
            }
          });
        }
        return entries;
      };
    }
    
    return config;
  },
};

export default nextConfig;

