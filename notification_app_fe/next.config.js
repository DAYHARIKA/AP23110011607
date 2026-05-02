/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/evaluation-service/:path*',
        destination: 'http://20.207.122.201/evaluation-service/:path*',
      },
    ]
  },
}

module.exports = nextConfig
