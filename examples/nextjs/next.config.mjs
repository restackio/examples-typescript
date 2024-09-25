/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@restackio/restack-sdk-ts'],
  },
}
export default nextConfig;
