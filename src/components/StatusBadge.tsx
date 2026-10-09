import { memo } from "react";
import type { LayerStatus } from "../domain/layers";

const LABELS: Record<LayerStatus, string> = {
  idle: "выключен",
  loading: "loading…",
  success: "success",
  error: "error",
};

export const StatusBadge = memo(function StatusBadge({ status }: { readonly status: LayerStatus }) {
  return (
    <span className={`badge badge--${status}`} data-testid="status">
      {LABELS[status]}
    </span>
  );
});
