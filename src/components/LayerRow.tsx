import { memo, type ChangeEvent } from "react";
import type { LayerConfig } from "../domain/layers";
import { useLayer } from "../store/layersStore";
import { useLayersServices } from "../store/LayersProvider";
import { StatusBadge } from "./StatusBadge";

export const LayerRow = memo(function LayerRow({ layer }: { readonly layer: LayerConfig }) {
  const { controller } = useLayersServices();
  const { enabled, opacity, request } = useLayer(layer.id);

  const onToggle = () => controller.toggle(layer.id);
  const onOpacity = (event: ChangeEvent<HTMLInputElement>) =>
    controller.setOpacity(layer.id, event.currentTarget.valueAsNumber / 100);

  return (
    <li className={`layer-row layer-row--${layer.kind}`} data-testid={`layer-${layer.id}`}>
      <label className="layer-row__toggle">
        <input type="checkbox" checked={enabled} onChange={onToggle} />
        {layer.title}
      </label>

      <input
        className="layer-row__opacity"
        type="range"
        min={0}
        max={100}
        value={Math.round(opacity * 100)}
        onChange={onOpacity}
        aria-label={`Прозрачность: ${layer.title}`}
      />
      <span className="layer-row__opacity-value">{Math.round(opacity * 100)}%</span>

      <StatusBadge status={request.status} />

      {request.status === "error" && (
        <span className="layer-row__error">
          {request.error}{" "}
          <button type="button" onClick={() => controller.retry(layer.id)}>
            Повторить
          </button>
        </span>
      )}
    </li>
  );
});
