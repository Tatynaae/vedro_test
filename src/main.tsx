import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createMockLayerApi } from "./api/layerApi";
import { App } from "./App";
import { createLayerRegistry } from "./domain/layers";
import { LayersProvider } from "./store/LayersProvider";
import "./styles.css";

const layerCount = Number(new URLSearchParams(window.location.search).get("layers")) || undefined;
const registry = createLayerRegistry(layerCount);
const fetchLayer = createMockLayerApi();

const root = document.getElementById("root");
if (!root) throw new Error("#root not found");

createRoot(root).render(
  <StrictMode>
    <LayersProvider registry={registry} fetchLayer={fetchLayer}>
      <App />
    </LayersProvider>
  </StrictMode>,
);
