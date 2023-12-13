export type NewTodo = {
  accountId: number;
  name: string;
  listId: number;
};

export type Todo = NewTodo & {
  id: number;
  completed: boolean;
  createdAt: Date;
};

export type TodoRow = {
  id: number;
  account_id: number;
  name: string;
  completed: boolean;
  list_id: number;
  created_at: string;
};
