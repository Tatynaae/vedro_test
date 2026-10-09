export type LayerKind = "temperature" | "wind" | "insolation";

declare const layerIdBrand: unique symbol;
export type LayerId = string & { readonly [layerIdBrand]: true };

export interface LayerConfig {
  readonly id: LayerId;
  readonly kind: LayerKind;
  readonly title: string;
}

export interface LayerData {
  readonly layerId: LayerId;
  readonly loadedAt: number;
  readonly grid: readonly number[];
}

export type LayerRequest =
  | { readonly status: "idle" }
  | { readonly status: "loading" }
  | { readonly status: "success"; readonly data: LayerData }
  | { readonly status: "error"; readonly error: string };

export type LayerStatus = LayerRequest["status"];

export interface LayerState {
  readonly enabled: boolean;
  readonly opacity: number;
  readonly request: LayerRequest;
}

export const DEFAULT_OPACITY = 0.7;

export const initialLayerState: LayerState = {
  enabled: false,
  opacity: DEFAULT_OPACITY,
  request: { status: "idle" },
};

const KIND_TITLES: Record<LayerKind, string> = {
  temperature: "Температура",
  wind: "Ветер",
  insolation: "Инсоляция",
};

const KINDS: readonly LayerKind[] = ["temperature", "wind", "insolation"];

const toLayerId = (value: string): LayerId => value as LayerId;

export function createLayerRegistry(count: number = KINDS.length): readonly LayerConfig[] {
  return Array.from({ length: Math.max(count, KINDS.length) }, (_, index) => {
    const kind = KINDS[index % KINDS.length] ?? "temperature";
    const isBase = index < KINDS.length;
    return {
      id: toLayerId(isBase ? kind : `${kind}-${index}`),
      kind,
      title: isBase ? KIND_TITLES[kind] : `${KIND_TITLES[kind]} #${index}`,
    };
  });
}
