const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.dealercarsearch.com' },
      { protocol: 'https', hostname: 'imagescdn.dealercarsearch.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' }
    ]
  }
}
module.exports = nextConfig
