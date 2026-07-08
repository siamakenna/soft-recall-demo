import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import SoftRecall from "@/game/SoftRecall";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SoftRecall />
  </StrictMode>,
);
