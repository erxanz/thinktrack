// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   allowedDevOrigins: ["192.168.1.38:3000", "thinktrackai.etres.my.id"],
// };

// export default nextConfig;
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Matikan PWA saat tahap development agar tidak mengganggu
});

const nextConfig = {
  // konfigurasi next.js Anda yang lain tetap di sini
};

export default withPWA(nextConfig);