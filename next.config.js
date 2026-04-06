/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-lib", "qrcode"],
  },
};

module.exports = nextConfig;
