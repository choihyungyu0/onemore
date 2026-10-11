import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 실제 이미지 연결 시 사용할 원격 호스트를 여기에 추가
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
