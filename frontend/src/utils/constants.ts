export const API = {
    TodoList: '/api/todo-lists',
    TodoListById: (todoId: number) => `/api/todo-lists/${todoId}`,
    TodoListItems: (todoId: number) => `/api/todo-lists/${todoId}/todo-items`,
    TodoListItemById: (todoId: number, itemId: number) => `/api/todo-lists/${todoId}/todo-items/${itemId}`
}