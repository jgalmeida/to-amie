import { Provider } from './provider';

export enum Status {
  Stopped = 'stopped',
  Warming = 'warming',
  Syncing = 'syncing',
}

export type Connection = {
  id: number;
  accountId: string;
  provider: Provider;
  status: Status;
  token: string;
  syncToken?: string;
  syncTokenExpiresAt?: Date;
  updatedAt: Date;
};

export type NewConnection = Omit<Connection, 'id'>;

export type ConnectionRow = {
  id: number;
  account_id: string;
  provider: string;
  status: string;
  token: string;
  sync_token?: string;
  sync_token_expires_at?: string;
  updated_at: string;
};
