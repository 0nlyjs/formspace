/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable gzip/brotli compression for all responses
  compress: true,

  // Enable Next.js Image Optimization with modern formats
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 604800, // 7 days
  },
};

export default nextConfig;
