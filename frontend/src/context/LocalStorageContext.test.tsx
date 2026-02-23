import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, act } from "@testing-library/react";
import { LocalStorageProvider, useLocalStorage } from "./LocalStorageContext";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

function TestComponent({ listId }: { listId: number }) {
  const { ordering, setListOrdering, getListOrdering, clearOrdering } = useLocalStorage();

  return (
    <div>
      <span data-testid="ordering">{JSON.stringify(ordering)}</span>
      <span data-testid="list-ordering">{JSON.stringify(getListOrdering(listId))}</span>
      <button onClick={() => setListOrdering(listId, [1, 2, 3])}>set ordering</button>
      <button onClick={() => setListOrdering(listId, [3, 2, 1])}>reorder</button>
      <button onClick={clearOrdering}>clear</button>
    </div>
  );
}

function renderWithProvider(listId: number) {
  const result = render(
    <LocalStorageProvider>
      <TestComponent listId={listId} />
    </LocalStorageProvider>
  );
  return {
    getOrdering: () => result.getByTestId("ordering").textContent,
    getListOrdering: () => result.getByTestId("list-ordering").textContent,
    clickSet: () => act(() => { result.getByText("set ordering").click(); }),
    clickReorder: () => act(() => { result.getByText("reorder").click(); }),
    clickClear: () => act(() => { result.getByText("clear").click(); }),
    ...result,
  };
}

describe("LocalStorageContext", () => {

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("should initialize with an empty ordering", () => {
    const { getOrdering } = renderWithProvider(1);
    expect(getOrdering()).toBe("{}");
  });

  it("should save the ordering for a list", () => {
    const { getListOrdering, clickSet } = renderWithProvider(1);
    clickSet();
    expect(getListOrdering()).toBe("[1,2,3]");
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "ordering",
      JSON.stringify({ 1: [1, 2, 3] })
    );
  });

  it("should return an empty array if no ordering exists for a list", () => {
    const { getListOrdering } = renderWithProvider(99);
    expect(getListOrdering()).toBe("[]");
  });

  it("should replace the existing ordering for a list", () => {
    const { getListOrdering, clickSet, clickReorder } = renderWithProvider(1);
    clickSet();
    clickReorder();
    expect(getListOrdering()).toBe("[3,2,1]");
  });

  it("should clear all ordering and remove it from localStorage", () => {
    const { getOrdering, clickSet, clickClear } = renderWithProvider(1);
    clickSet();
    clickClear();
    expect(getOrdering()).toBe("{}");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("ordering");
  });

  it("should load existing ordering from localStorage on mount", () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ 1: [3, 1, 2] }));
    const { getListOrdering } = renderWithProvider(1);
    expect(getListOrdering()).toBe("[3,1,2]");
  });

  it("should fallback to empty ordering if localStorage value is corrupted", () => {
    localStorageMock.getItem.mockReturnValueOnce("not valid json{{{");
    const { getOrdering } = renderWithProvider(1);
    expect(getOrdering()).toBe("{}");
  });
});