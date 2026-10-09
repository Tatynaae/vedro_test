import { memo } from "react";
import type { LayerConfig, LayerKind } from "../domain/layers";
import { useLayer } from "../store/layersStore";
import { useLayersServices } from "../store/LayersProvider";

const HUES: Record<LayerKind, number> = { temperature: 10, wind: 200, insolation: 50 };

const MapLayer = memo(function MapLayer({ layer }: { readonly layer: LayerConfig }) {
  const { enabled, opacity, request } = useLayer(layer.id);
  if (!enabled || request.status !== "success") return null;

  const hue = HUES[layer.kind];
  return (
    <div className="map__layer" style={{ opacity }} data-testid={`map-layer-${layer.id}`}>
      {request.data.grid.map((value, index) => (
        <div key={index} style={{ background: `hsla(${hue}, 85%, 50%, ${value})` }} />
      ))}
    </div>
  );
});

export const MapView = memo(function MapView() {
  const { registry } = useLayersServices();
  return (
    <section className="map" aria-label="Карта">
      {registry.map((layer) => (
        <MapLayer key={layer.id} layer={layer} />
      ))}
    </section>
  );
});
