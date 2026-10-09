import { renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { createLayerRegistry, type LayerId } from "../domain/layers";
import { LayersController } from "../store/layersController";
import { createInitialLayersState, LayersStoreProvider, useLayersStore } from "../store/layersStore";
import { at, createDeferredApi, flush } from "./deferredApi";

const id: LayerId = at(createLayerRegistry(), 0).id;

function setup(options?: { honorAbort?: boolean }) {
  const state = createInitialLayersState(createLayerRegistry());
  const wrapper = ({ children }: { children: ReactNode }) => createElement(LayersStoreProvider, { state, children });
  const store = renderHook(useLayersStore, { wrapper }).result.current;
  const api = createDeferredApi(options);
  const controller = new LayersController(store, api.fetchLayer);
  return { store, controller, calls: api.calls, layer: () => store.get(id) };
}

describe("LayersController", () => {
  it("enable → loading → success", async () => {
    const { controller, calls, layer } = setup();
    controller.toggle(id);
    expect(layer()).toMatchObject({ enabled: true, request: { status: "loading" } });

    at(calls, 0).resolve();
    await flush();
    expect(layer().request.status).toBe("success");
  });

  it("error → retry → success", async () => {
    const { controller, calls, layer } = setup();
    controller.toggle(id);
    at(calls, 0).reject("boom");
    await flush();
    expect(layer().request).toEqual({ status: "error", error: "boom" });

    controller.retry(id);
    expect(layer().request.status).toBe("loading");
    at(calls, 1).resolve();
    await flush();
    expect(layer().request.status).toBe("success");
  });

  it("retry is ignored unless the layer is enabled and in error", () => {
    const { controller, calls } = setup();
    controller.retry(id);
    controller.toggle(id);
    controller.retry(id);
    expect(calls).toHaveLength(1);
  });

  it("disable aborts the request; its late response is ignored", async () => {
    const { controller, calls, layer } = setup({ honorAbort: false });
    controller.toggle(id);
    controller.toggle(id);
    expect(at(calls, 0).signal.aborted).toBe(true);

    at(calls, 0).resolve();
    await flush();
    expect(layer()).toMatchObject({ enabled: false, request: { status: "idle" } });
  });

  it.each([true, false])("on→off→on: only the latest response wins (honorAbort=%s)", async (honorAbort) => {
    const { controller, calls, layer } = setup({ honorAbort });
    controller.toggle(id);
    controller.toggle(id);
    controller.toggle(id);
    expect(calls).toHaveLength(2);

    at(calls, 1).resolve();
    await flush();
    at(calls, 0).reject("stale");
    await flush();

    expect(layer().request).toMatchObject({ status: "success", data: { grid: [2] } });
  });

  it("stale success does not overwrite a fresh loading state", async () => {
    const { controller, calls, layer } = setup({ honorAbort: false });
    controller.toggle(id);
    controller.toggle(id);
    controller.toggle(id);
    at(calls, 0).resolve();
    await flush();
    expect(layer().request.status).toBe("loading");
  });

  it("opacity is clamped and does not touch the request", () => {
    const { controller, layer } = setup();
    controller.setOpacity(id, 1.5);
    expect(layer()).toMatchObject({ opacity: 1, request: { status: "idle" } });
    controller.setOpacity(id, -1);
    expect(layer().opacity).toBe(0);
  });

  it("dispose aborts everything in flight", () => {
    const { controller, calls } = setup();
    controller.setAllEnabled(createLayerRegistry().map((l) => l.id), true);
    controller.dispose();
    expect(calls.every((call) => call.signal.aborted)).toBe(true);
  });
});
