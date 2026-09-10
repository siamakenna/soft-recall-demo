import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import DesktopViewportGuard from "@/game/DesktopViewportGuard";
import SoftRecall from "@/game/SoftRecall";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DesktopViewportGuard>
      <SoftRecall />
    </DesktopViewportGuard>
  </StrictMode>,
);
