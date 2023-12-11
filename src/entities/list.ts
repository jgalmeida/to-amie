export type NewList = {
  name: string;
};

export type List = NewList & {
  id: number;
  createdAt: Date;
};

export type ListRow = {
  id: number;
  name: string;
  created_at: string;
};
