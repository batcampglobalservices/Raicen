import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "edulearn",
    short_name: "edulearn",
    description: "A calmer way to learn, practise, and grow.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f6f0",
    theme_color: "#1f5e4c",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
