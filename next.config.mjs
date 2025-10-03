/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "cdn.codechef.com" },
      { protocol: "https", hostname: "assets.interviewbit.com" },
      { protocol: "https", hostname: "sta.codeforces.com" },
      { protocol: "https", hostname: "img.atcoder.jp" },
      { protocol: "https", hostname: "cdn-icons-png.flaticon.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "tse1.mm.bing.net" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
