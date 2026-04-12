/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: [
    'b1620242-6907-4ff5-8542-179a16947868-00-h4e56vt0qkdk.kirk.replit.dev',
    '*.replit.dev',
    '*.kirk.replit.dev',
  ],
};

export default nextConfig;
