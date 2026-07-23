/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Sharp es una dependencia nativa; la excluimos del bundling del servidor
  // para que Next/Netlify la resuelvan desde node_modules en runtime.
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
};

export default nextConfig;
