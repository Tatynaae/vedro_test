import { AbortError, type FetchLayer } from "../api/layerApi";
import type { LayerData, LayerId } from "../domain/layers";

interface PendingCall {
  readonly layerId: LayerId;
  readonly signal: AbortSignal;
  resolve(): void;
  reject(message: string): void;
}

export function createDeferredApi({ honorAbort = true }: { honorAbort?: boolean } = {}) {
  const calls: PendingCall[] = [];

  const fetchLayer: FetchLayer = (layerId, signal) =>
    new Promise<LayerData>((resolve, reject) => {
      if (honorAbort) signal.addEventListener("abort", () => reject(new AbortError()), { once: true });
      calls.push({
        layerId,
        signal,
        resolve: () => resolve({ layerId, loadedAt: calls.length, grid: [calls.length] }),
        reject: (message) => reject(new Error(message)),
      });
    });

  return { fetchLayer, calls };
}

export const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

export function at<T>(items: readonly T[], index: number): T {
  const item = items[index];
  if (item === undefined) throw new Error(`No item at index ${index}`);
  return item;
}
