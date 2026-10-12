export function GET() {
  return Response.json(
    {
      name: "IEEE SRMIST Check-in",
      short_name: "Check-in",
      description: "Scan IEEE SRMIST event tickets at the door.",
      start_url: "/scan",
      scope: "/scan",
      display: "standalone",
      orientation: "portrait",
      background_color: "#ffffff",
      theme_color: "#ffffff",
      icons: [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        {
          src: "/icons/icon-maskable-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } },
  );
}
