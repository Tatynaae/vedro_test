import { memo } from "react";
import { useLayersSelector } from "../store/layersStore";

export const LayersSummary = memo(function LayersSummary() {
  const summary = useLayersSelector((state) => {
    let enabled = 0;
    let loading = 0;
    let errors = 0;
    for (const layer of Object.values(state)) {
      if (layer.enabled) enabled += 1;
      if (layer.request.status === "loading") loading += 1;
      if (layer.request.status === "error") errors += 1;
    }
    return `включено: ${enabled} · загружается: ${loading} · ошибок: ${errors}`;
  });

  return <p className="summary">{summary}</p>;
});
