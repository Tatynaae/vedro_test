import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { Profiler, type ProfilerOnRenderCallback } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { LayerRow } from "../components/LayerRow";
import { createLayerRegistry } from "../domain/layers";
import { LayersProvider } from "../store/LayersProvider";
import { at, createDeferredApi, flush } from "./deferredApi";

afterEach(cleanup);

function renderRows(count: number) {
  const registry = createLayerRegistry(count);
  const api = createDeferredApi();
  const renders = new Map<string, number>();
  const onRender: ProfilerOnRenderCallback = (id) => renders.set(id, (renders.get(id) ?? 0) + 1);

  render(
    <LayersProvider registry={registry} fetchLayer={api.fetchLayer}>
      <ul>
        {registry.map((layer) => (
          <Profiler key={layer.id} id={layer.id} onRender={onRender}>
            <LayerRow layer={layer} />
          </Profiler>
        ))}
      </ul>
    </LayersProvider>,
  );
  renders.clear();
  return { registry, api, renders };
}

describe("render isolation", () => {
  it("toggling one of 150 layers re-renders only that row", async () => {
    const { registry, api, renders } = renderRows(150);
    const target = at(registry, 42);

    fireEvent.click(within(screen.getByTestId(`layer-${target.id}`)).getByRole("checkbox"));
    await act(async () => {
      at(api.calls, 0).resolve();
      await flush();
    });

    expect([...renders.keys()]).toEqual([target.id]);
    expect(renders.get(target.id)).toBe(2);
  });

  it("changing opacity re-renders only that row", () => {
    const { registry, renders } = renderRows(10);
    const target = at(registry, 3);

    fireEvent.change(screen.getByLabelText(`Прозрачность: ${target.title}`), { target: { value: "20" } });

    expect([...renders.keys()]).toEqual([target.id]);
    expect(screen.getByTestId(`layer-${target.id}`).textContent).toContain("20%");
  });
});
