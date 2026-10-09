import { AbortError, type FetchLayer } from "../api/layerApi";
import type { LayerId, LayerState } from "../domain/layers";
import type { LayersStore } from "./layersStore";

export class LayersController {
  private readonly inFlight = new Map<LayerId, AbortController>();

  constructor(
    private readonly store: LayersStore,
    private readonly fetchLayer: FetchLayer,
  ) {}

  readonly toggle = (id: LayerId): void => {
    this.setEnabled(id, !this.store.get(id).enabled);
  };

  readonly setEnabled = (id: LayerId, enabled: boolean): void => {
    if (this.store.get(id).enabled === enabled) return;
    if (enabled) {
      this.patch(id, { enabled: true });
      void this.load(id);
    } else {
      this.cancel(id);
      this.patch(id, { enabled: false, request: { status: "idle" } });
    }
  };

  readonly setAllEnabled = (ids: readonly LayerId[], enabled: boolean): void => {
    ids.forEach((id) => this.setEnabled(id, enabled));
  };

  readonly retry = (id: LayerId): void => {
    const layer = this.store.get(id);
    if (!layer.enabled || layer.request.status !== "error") return;
    void this.load(id);
  };

  readonly setOpacity = (id: LayerId, opacity: number): void => {
    const next = Math.min(1, Math.max(0, opacity));
    if (this.store.get(id).opacity === next) return;
    this.patch(id, { opacity: next });
  };

  readonly dispose = (): void => {
    this.inFlight.forEach((controller) => controller.abort());
    this.inFlight.clear();
  };

  private async load(id: LayerId): Promise<void> {
    this.cancel(id);
    const controller = new AbortController();
    this.inFlight.set(id, controller);
    this.patch(id, { request: { status: "loading" } });

    try {
      const data = await this.fetchLayer(id, controller.signal);
      if (!this.settle(id, controller)) return;
      this.patch(id, { request: { status: "success", data } });
    } catch (error: unknown) {
      if (!this.settle(id, controller) || error instanceof AbortError) return;
      this.patch(id, { request: { status: "error", error: errorMessage(error) } });
    }
  }

  private settle(id: LayerId, controller: AbortController): boolean {
    if (this.inFlight.get(id) !== controller || controller.signal.aborted) return false;
    this.inFlight.delete(id);
    return true;
  }

  private cancel(id: LayerId): void {
    this.inFlight.get(id)?.abort();
    this.inFlight.delete(id);
  }

  private patch(id: LayerId, patch: Partial<LayerState>): void {
    this.store.dispatch(id, { ...this.store.get(id), ...patch });
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Неизвестная ошибка";
}
