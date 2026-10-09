import type { LayerData, LayerId } from "../domain/layers";

export type FetchLayer = (layerId: LayerId, signal: AbortSignal) => Promise<LayerData>;

export class AbortError extends Error {
  override readonly name = "AbortError";
  constructor() {
    super("Request aborted");
  }
}

export interface MockApiOptions {
  readonly minDelayMs: number;
  readonly maxDelayMs: number;
  readonly failureRate: number;
  readonly random: () => number;
}

const defaultOptions: MockApiOptions = {
  minDelayMs: 300,
  maxDelayMs: 1500,
  failureRate: 0.25,
  random: Math.random,
};

const GRID_SIZE = 16;

export function createMockLayerApi(overrides: Partial<MockApiOptions> = {}): FetchLayer {
  const { minDelayMs, maxDelayMs, failureRate, random } = { ...defaultOptions, ...overrides };

  return (layerId, signal) =>
    new Promise<LayerData>((resolve, reject) => {
      if (signal.aborted) {
        reject(new AbortError());
        return;
      }

      const delay = minDelayMs + random() * (maxDelayMs - minDelayMs);
      const timer = setTimeout(() => {
        signal.removeEventListener("abort", onAbort);
        if (random() < failureRate) {
          reject(new Error(`Сервер не отдал слой «${layerId}» (503)`));
          return;
        }
        resolve({
          layerId,
          loadedAt: Date.now(),
          grid: Array.from({ length: GRID_SIZE }, () => random()),
        });
      }, delay);

      function onAbort(): void {
        clearTimeout(timer);
        reject(new AbortError());
      }
      signal.addEventListener("abort", onAbort, { once: true });
    });
}
