export type TodoLink = {
  id: number;
  acccountId: number;
  connectionId: number;
  todoId: number;
  providerId: string;
};

export type NewTodoLink = Omit<TodoLink, 'id'>;

export type TodoLinkRow = {
  id: number;
  account_id: number;
  connection_id: number;
  todo_id: number;
  provider_id: string;
};
