import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tdcvczpwrjghejxktwbv.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'arcgxazaxfmxinjtkshr.supabase.co',
      },
    ],
  },
}

export default nextConfig