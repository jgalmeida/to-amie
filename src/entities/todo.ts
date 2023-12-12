export type NewTodo = {
  accountId: string;
  name: string;
  completed: boolean;
  listId: number;
};

export type Todo = NewTodo & {
  id: number;
  createdAt: Date;
};

export type TodoRow = {
  id: number;
  account_id: string;
  name: string;
  completed: boolean;
  list_id: number;
  created_at: string;
};
