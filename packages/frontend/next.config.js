/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["commonlib", "backendsdk"],
  async redirects() {
    return [
      { source: "/app/products", destination: "/app/apply", permanent: false },
      { source: "/app/products/:slug", destination: "/app/apply", permanent: false },
      { source: "/app/products/:slug/apply", destination: "/app/apply", permanent: false },
      { source: "/app/matching", destination: "/app/apply/recommendations", permanent: false },
      { source: "/app/offers", destination: "/app/apply/recommendations", permanent: false },
    ];
  },
};

module.exports = nextConfig;
