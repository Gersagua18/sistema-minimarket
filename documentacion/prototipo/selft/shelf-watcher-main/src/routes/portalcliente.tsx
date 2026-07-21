import { createFileRoute } from "@tanstack/react-router";
import ClientPortal from "@/components/views/ClientPortal";
import { StoreProvider } from "@/lib/store";

export const Route = createFileRoute("/portalcliente")({
  head: () => ({
    meta: [
      { title: "Portal Cliente — MiniStock" },
      { name: "description", content: "Explora el catálogo del minimarket, encuentra productos y ubica su anaquel en tiempo real." },
      { property: "og:title", content: "Portal Cliente — MiniStock" },
      { property: "og:description", content: "Catálogo interactivo y mapa de anaqueles para clientes de minimarkets." },
    ],
  }),
  component: () => (
    <StoreProvider>
      <ClientPortal />
    </StoreProvider>
  ),
});
