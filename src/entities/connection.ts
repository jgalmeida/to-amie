import { Provider } from './provider';

export enum Status {
  Stopped = 'stopped',
  Warming = 'warming',
  Syncing = 'syncing',
}

export type Connection = {
  id: number;
  accountId: number;
  provider: Provider;
  status: Status;
  token: string;
  syncToken?: string;
  updatedAt: Date;
};

export type NewConnection = Omit<Connection, 'id'>;

export type ConnectionRow = {
  id: number;
  account_id: number;
  provider: string;
  status: string;
  token: string;
  sync_token?: string;
  updated_at: string;
};
