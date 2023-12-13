export type Paginated<T> = {
  hasMore: boolean;
  after: number;
  data: T;
};
