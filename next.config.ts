import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker 用に standalone モードを有効化
  output: "standalone",
  
  // 画像の最適化設定
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  
  // 実験的な機能
  experimental: {
    // Server Actions を有効化
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
