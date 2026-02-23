import { useEffect, useCallback, useReducer } from "react";
import { API } from "../utils/constants";
import { useLocalStorage } from "../context/LocalStorageContext";

export interface TodoItem {
    id: number;
    name: string;
    description: string;
    done: boolean;
}

export interface TodoList {
    id: number;
    name: string;
    todoItems: TodoItem[];
}

interface TodoState {
    todoLists: TodoList[];
    loading: boolean;
    error: string | null;
    snapshot: TodoList[] | null;
}

const initialState: TodoState = {
    todoLists: [],
    snapshot: null,
    loading: false,
    error: null,
};

type TodoAction =
    | { type: "FETCH_START"; payload?: undefined }
    | { type: "FETCH_SUCCESS"; payload: TodoList[] }
    | { type: "FETCH_ERROR"; payload: string }
    | { type: "ADD_LIST"; payload: TodoList }
    | { type: "REMOVE_LIST"; payload: { listId: number } }
    | { type: "ADD_ITEM"; payload: { listId: number; item: TodoItem } }
    | { type: "REMOVE_ITEM"; payload: { listId: number; itemId: number } }
    | { type: "TOGGLE_ITEM"; payload: { listId: number; itemId: number } }
    | { type: "UPDATE_ITEM"; payload: { listId: number; itemId: number; updates: Partial<Omit<TodoItem, "id">> } }
    | { type: "UPDATE_LIST"; payload: { listId: number; updates: Partial<Omit<TodoList, "id">> } } | { type: "MUTATION_COMMIT"; payload?: undefined }
    | { type: "MUTATION_ROLLBACK"; payload?: undefined };


function todoReducer(state: TodoState, action: TodoAction): TodoState {
    switch (action.type) {

        case "FETCH_START":
            return { ...state, loading: true, error: null };

        case "FETCH_SUCCESS":
            return { ...state, loading: false, todoLists: action.payload };

        case "FETCH_ERROR":
            return { ...state, loading: false, error: action.payload };

        case "ADD_LIST":
            return {
                ...state,
                snapshot: state.todoLists,
                todoLists: [...state.todoLists, action.payload],
            };

        case "REMOVE_LIST":
            return {
                ...state,
                snapshot: state.todoLists,
                todoLists: state.todoLists.filter((list) => list.id !== action.payload.listId),
            };

        case "UPDATE_LIST":
            return {
                ...state,
                snapshot: state.todoLists,
                todoLists: state.todoLists.map((list) =>
                    list.id === action.payload.listId ? { ...list, ...action.payload.updates } : list
                ),
            };

        case "ADD_ITEM":
            return {
                ...state,
                snapshot: state.todoLists,
                todoLists: state.todoLists.map((list) =>
                    list.id === action.payload.listId
                        ? { ...list, todoItems: [...list.todoItems, action.payload.item] }
                        : list
                ),
            };

        case "REMOVE_ITEM":
            return {
                ...state,
                snapshot: state.todoLists,
                todoLists: state.todoLists.map((list) =>
                    list.id === action.payload.listId
                        ? { ...list, todoItems: list.todoItems.filter((item) => item.id !== action.payload.itemId) }
                        : list
                ),
            };

        case "TOGGLE_ITEM":
            return {
                ...state,
                snapshot: state.todoLists,
                todoLists: state.todoLists.map((list) =>
                    list.id === action.payload.listId
                        ? {
                            ...list,
                            todoItems: list.todoItems.map((item) =>
                                item.id === action.payload.itemId ? { ...item, done: !item.done } : item
                            ),
                        }
                        : list
                ),
            };

        case "UPDATE_ITEM":
            return {
                ...state,
                snapshot: state.todoLists,
                todoLists: state.todoLists.map((list) =>
                    list.id === action.payload.listId
                        ? {
                            ...list,
                            todoItems: list.todoItems.map((item) =>
                                item.id === action.payload.itemId
                                    ? { ...item, ...action.payload.updates }
                                    : item
                            ),
                        }
                        : list
                ),
            };

        case "MUTATION_COMMIT":
            return { ...state, snapshot: null, error: null };

        case "MUTATION_ROLLBACK":
            return {
                ...state,
                todoLists: state.snapshot ?? state.todoLists,
                snapshot: null,
                error: "La operación falló, los cambios fueron revertidos.",
            };

        default:
            return state;
    }
}

function useMutation(dispatch: React.Dispatch<TodoAction>, refetch: () => Promise<void>) {
    return useCallback(
        async (optimisticAction: TodoAction, apiFn: () => Promise<Response>) => {
            dispatch(optimisticAction);
            try {
                await apiFn();
                await refetch();
                dispatch({ type: "MUTATION_COMMIT" });
            } catch {
                dispatch({ type: "MUTATION_ROLLBACK" });
            }
        },
        [dispatch]
    );
}

interface UseTodoListReturn {
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

function sortByOrdering(items: TodoItem[], ordering: number[]): TodoItem[] {
    if (ordering.length === 0) return items;

    return [...items].sort((a, b) => {
        const indexA = ordering.indexOf(a.id);
        const indexB = ordering.indexOf(b.id);

        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        return indexA - indexB;
    });
}

export function useTodoList(): UseTodoListReturn {
    const [state, dispatch] = useReducer(todoReducer, initialState);
    const { getListOrdering, setListOrdering } = useLocalStorage();
    const fetchTodoLists = useCallback(async () => {
        dispatch({ type: "FETCH_START" });
        try {
            const response = await fetch(API.TodoList);
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            const data: TodoList[] = await response.json();

            const sorted = data.map((list) => {
                const ordering = getListOrdering(list.id);

                if (ordering.length === 0) {
                    // 👇 no existe ordering, lo creamos con el orden que viene de la API
                    const defaultOrdering = list.todoItems.map((item) => item.id);
                    setListOrdering(list.id, defaultOrdering);
                    return list;
                }

                return {
                    ...list,
                    todoItems: sortByOrdering(list.todoItems, ordering),
                };
            });

            dispatch({ type: "FETCH_SUCCESS", payload: sorted });
        } catch (err) {
            dispatch({ type: "FETCH_ERROR", payload: err instanceof Error ? err.message : "Unknown error" });
        }
    }, [getListOrdering, setListOrdering]);

    const mutate = useMutation(dispatch, fetchTodoLists);


    useEffect(() => {
        fetchTodoLists();
    }, [fetchTodoLists]);



    const addList = useCallback((name: string) => {
        mutate(
            { type: "ADD_LIST", payload: { name, id: Date.now(), todoItems: [] } },
            () => fetch(API.TodoList, {
                method: "POST", headers: {
                    "Content-Type": "application/json",
                }, body: JSON.stringify({ name })
            })
        );
    }, [mutate]);

    const removeList = useCallback((listId: number) => {
        mutate(
            { type: "REMOVE_LIST", payload: { listId } },
            () => fetch(API.TodoListById(listId), { method: "DELETE" })
        );
    }, [mutate]);

    const updateList = useCallback((listId: number, updates: Partial<Omit<TodoList, "id">>) => {
        mutate(
            { type: "UPDATE_LIST", payload: { listId, updates } },
            () => fetch(API.TodoListById(listId), {
                method: "PUT", headers: {
                    "Content-Type": "application/json",
                }, body: JSON.stringify(updates)
            })
        );
    }, [mutate]);

    const addItem = useCallback((listId: number, name: string) => {
        const newItem: TodoItem = { id: Date.now(), name, description: '', done: false }

        mutate(
            { type: "ADD_ITEM", payload: { listId, item: newItem } },
            () => fetch(API.TodoListItems(listId), {
                method: "POST", headers: {
                    "Content-Type": "application/json",
                }, body: JSON.stringify({ name, description: '' })
            })
        );
    }, [mutate]);

    const removeItem = useCallback((listId: number, itemId: number) => {
        mutate(
            { type: "REMOVE_ITEM", payload: { listId, itemId } },
            () => fetch(API.TodoListItemById(listId, itemId), { method: "DELETE" })
        );
    }, [mutate]);

    const toggleItem = useCallback((listId: number, itemId: number) => {

        const list = state.todoLists.find(l => l.id === listId);
        const item = list?.todoItems.find(i => i.id === itemId);
        if (!item) return;

        mutate(
            { type: "TOGGLE_ITEM", payload: { listId, itemId } },
            () => fetch(API.TodoListItemById(listId, itemId), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: item.name, description: item.description, done: !item.done })
            })
        );
    }, [mutate, state.todoLists]);

    const updateItem = useCallback(
        (listId: number, itemId: number, updates: Partial<Omit<TodoItem, "id">>) => {
            mutate(
                { type: "UPDATE_ITEM", payload: { listId, itemId, updates } },
                () => fetch(API.TodoListItemById(listId, itemId), {
                    method: "PUT", headers: {
                        "Content-Type": "application/json",
                    }, body: JSON.stringify(updates)
                })
            );
        },
        [mutate]
    );

    return {
        todoLists: state.todoLists,
        loading: state.loading,
        error: state.error,
        addList,
        removeList,
        toggleItem,
        addItem,
        removeItem,
        updateItem,
        updateList,
        refetch: fetchTodoLists,
    };
}