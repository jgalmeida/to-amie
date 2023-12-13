export type TodoLink = {
  id: number;
  acccountId: number;
  connectionId: number;
  todoId: string;
  providerId: string;
};

export type NewTodoLink = Omit<TodoLink, 'id'>;

export type TodoLinkRow = {
  id: number;
  account_id: number;
  connection_id: number;
  todo_id: string;
  provider_id: string;
};
