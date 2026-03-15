import type { NextConfig } from "next";
import { allowedImageHosts } from "./src/lib/config";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: allowedImageHosts.map((hostname) => ({
      protocol: "https",
      hostname
    })),
    minimumCacheTTL: 3600
  }
};

export default nextConfig;
