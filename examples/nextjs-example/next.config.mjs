/** @type {import('next').NextConfig} */
const nextConfig = {
  // The workspace package ships pure ESM compiled by tsc; let Next transpile it
  // alongside the app so its module format is normalized.
  transpilePackages: ["use-ripple-hook"],
};

export default nextConfig;
