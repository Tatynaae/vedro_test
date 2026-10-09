import { useCallback, useSyncExternalStore } from "react";
import { createVedro } from "vedro";
import type Vedro from "vedro";
import { initialLayerState, type LayerConfig, type LayerId, type LayerState } from "../domain/layers";

export type LayersState = Record<LayerId, LayerState>;
export type LayersStore = Vedro<LayersState>;

export function createInitialLayersState(registry: readonly LayerConfig[]): LayersState {
  return Object.fromEntries(registry.map((layer) => [layer.id, initialLayerState]));
}

export const {
  Provider: LayersStoreProvider,
  useStore: useLayersStore,
  useSelector: useLayersSelector,
} = createVedro<LayersState>({});

export function useLayer(id: LayerId): LayerState {
  const store = useLayersStore();
  const subscribe = useCallback((onChange: () => void) => store.on(id, onChange), [store, id]);
  const getSnapshot = useCallback(() => store.get(id), [store, id]);
  return useSyncExternalStore(subscribe, getSnapshot);
}
