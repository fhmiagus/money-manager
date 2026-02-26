import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    domains: [
      'tdcvczpwrjghejxktwbv.supabase.co',
      'arcgxazaxfmxinjtkshr.supabase.co',
    ],
  },
}

export default nextConfig