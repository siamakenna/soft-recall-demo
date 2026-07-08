import { createFileRoute } from "@tanstack/react-router";
import SoftRecall from "@/game/SoftRecall";

export const Route = createFileRoute("/")({
  component: SoftRecall,
});
