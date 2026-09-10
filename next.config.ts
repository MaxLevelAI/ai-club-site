import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Pin the project root so the build ignores unrelated lockfiles elsewhere on
  // the machine.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
