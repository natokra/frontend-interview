import { createContext, useContext, ReactNode } from "react";
import { useTodoList, TodoList, TodoItem } from "../hooks/useTodoList";

interface TodoContextType {
  todoLists: TodoList[];
  loading: boolean;
  error: string | null;
  addList: (name: string) => void;
  removeList: (listId: number) => void;
  toggleItem: (listId: number, itemId: number) => void;
  addItem: (listId: number, item: string) => void;
  removeItem: (listId: number, itemId: number) => void;
  updateItem: (listId: number, itemId: number, updates: Partial<Omit<TodoItem, "id">>) => void;
  updateList: (listId: number, updates: Partial<Omit<TodoList, "id">>) => void;
  refetch: () => void;
}

const TodoContext = createContext<TodoContextType | null>(null);

export function TodoProvider({ children }: { children: ReactNode }) {
  const todoList = useTodoList();
  return <TodoContext.Provider value={todoList}>{children}</TodoContext.Provider>;
}

export function useTodo() {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error("useTodo debe usarse dentro de <TodoProvider>");
  return ctx;
}