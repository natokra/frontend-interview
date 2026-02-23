import { createContext, useContext, useState, useCallback, ReactNode, useRef } from "react";

type Ordering = Record<number, number[]>;

interface LocalStorageContextType {
  ordering: Ordering;
  setListOrdering: (listId: number, itemIds: number[]) => void;
  getListOrdering: (listId: number) => number[];
  clearOrdering: () => void;
}

const STORAGE_KEY = "ordering";

function loadOrdering(): Ordering {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveOrdering(ordering: Ordering) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ordering));
}

const LocalStorageContext = createContext<LocalStorageContextType | null>(null);

export function LocalStorageProvider({ children }: { children: ReactNode }) {
  const [ordering, setOrdering] = useState<Ordering>(loadOrdering);
  const orderingRef = useRef<Ordering>(ordering);

  const setListOrdering = useCallback((listId: number, itemIds: number[]) => {
    setOrdering((prev) => {
      const updated = { ...prev, [listId]: itemIds };
      orderingRef.current = updated;
      saveOrdering(updated);
      return updated;
    });
  }, []);

  const getListOrdering = useCallback((listId: number): number[] => {
    return orderingRef.current[listId] ?? [];
  }, []);

  const clearOrdering = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setOrdering({});
  }, []);

  return (
    <LocalStorageContext.Provider value={{ ordering, setListOrdering, getListOrdering, clearOrdering }}>
      {children}
    </LocalStorageContext.Provider>
  );
}

export function useLocalStorage() {
  const ctx = useContext(LocalStorageContext);
  if (!ctx) throw new Error("useLocalStorage debe usarse dentro de <LocalStorageProvider>");
  return ctx;
}