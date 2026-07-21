import { createFileRoute } from "@tanstack/react-router";
import MinimarketApp from "@/components/MinimarketApp";

export const Route = createFileRoute("/panel")({
  head: () => ({
    meta: [
      { title: "Panel de gestión — MiniStock" },
      { name: "description", content: "Sistema de gestión para administradores y empleados: inventario, ventas, anaqueles 2.5D y reportes." },
      { property: "og:title", content: "Panel de gestión — MiniStock" },
      { property: "og:description", content: "Control operativo del minimarket." },
    ],
  }),
  component: () => <MinimarketApp />,
});
