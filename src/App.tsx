import { LayerPanel } from "./components/LayerPanel";
import { MapView } from "./components/MapView";

export function App() {
  return (
    <main className="app">
      <MapView />
      <LayerPanel />
    </main>
  );
}
