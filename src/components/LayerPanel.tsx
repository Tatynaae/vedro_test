import { memo } from "react";
import { useLayersServices } from "../store/LayersProvider";
import { LayerRow } from "./LayerRow";
import { LayersSummary } from "./LayersSummary";

export const LayerPanel = memo(function LayerPanel() {
  const { registry, controller } = useLayersServices();
  const ids = registry.map((layer) => layer.id);

  return (
    <section className="panel">
      <h2>Слои ({registry.length})</h2>
      <LayersSummary />
      <div className="panel__bulk">
        <button type="button" onClick={() => controller.setAllEnabled(ids, true)}>
          Включить все
        </button>
        <button type="button" onClick={() => controller.setAllEnabled(ids, false)}>
          Выключить все
        </button>
      </div>
      <ul className="panel__list">
        {registry.map((layer) => (
          <LayerRow key={layer.id} layer={layer} />
        ))}
      </ul>
    </section>
  );
});
