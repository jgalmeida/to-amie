export type TodoLink = {
  id: number;
  connectionId: string;
  todoId: string;
  providerId: string;
};

export type NewTodoLink = Omit<TodoLink, 'id'>;

export type TodoLinkRow = {
  id: number;
  connection_id: string;
  todo_id: string;
  provider_id: string;
};
