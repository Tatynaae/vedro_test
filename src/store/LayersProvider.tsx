import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { FetchLayer } from "../api/layerApi";
import type { LayerConfig } from "../domain/layers";
import { LayersController } from "./layersController";
import { createInitialLayersState, LayersStoreProvider, useLayersStore } from "./layersStore";

interface LayersServices {
  readonly registry: readonly LayerConfig[];
  readonly controller: LayersController;
}

const LayersServicesContext = createContext<LayersServices | null>(null);

export function useLayersServices(): LayersServices {
  const services = useContext(LayersServicesContext);
  if (!services) throw new Error("useLayersServices must be used inside <LayersProvider>");
  return services;
}

interface LayersProviderProps {
  readonly registry: readonly LayerConfig[];
  readonly fetchLayer: FetchLayer;
  readonly children: ReactNode;
}

export function LayersProvider({ registry, fetchLayer, children }: LayersProviderProps) {
  const [initialState] = useState(() => createInitialLayersState(registry));
  return (
    <LayersStoreProvider state={initialState}>
      <LayersServicesProvider registry={registry} fetchLayer={fetchLayer}>
        {children}
      </LayersServicesProvider>
    </LayersStoreProvider>
  );
}

function LayersServicesProvider({ registry, fetchLayer, children }: LayersProviderProps) {
  const store = useLayersStore();
  const [controller] = useState(() => new LayersController(store, fetchLayer));

  useEffect(() => controller.dispose, [controller]);

  const services = useMemo(() => ({ registry, controller }), [registry, controller]);
  return <LayersServicesContext.Provider value={services}>{children}</LayersServicesContext.Provider>;
}
