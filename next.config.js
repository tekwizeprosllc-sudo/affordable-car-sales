const nextConfig = {
  reactStrictMode: true,
  // pglite loads WASM from disk and breaks when webpack bundles it. It is only
  // used as the local dev database; production talks to Neon over HTTP.
  experimental: {
    serverComponentsExternalPackages: ['@electric-sql/pglite'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.dealercarsearch.com' },
      { protocol: 'https', hostname: 'imagescdn.dealercarsearch.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' }
    ]
  }
}
module.exports = nextConfig
