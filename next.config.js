/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 图片优化配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // 编译器选项
  compiler: {
    // 移除控制台日志（生产环境）
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 环境变量
  env: {
    APP_NAME: "Shirley's AI Reading Coach",
    APP_VERSION: "1.0.0",
  },
}

module.exports = nextConfig
