/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // O cache em disco do Turbopack falha em pastas com espaços, como "BRAIN SSD".
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
