import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: "/landing-decis",
        destination: "/landing-decision",
        permanent: true,
      },
      {
        source: "/landing-assets",
        destination: "/landing-download/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
