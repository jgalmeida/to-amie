import { Todo } from './todo';

export enum EventType {
  Create = 'create',
  Update = 'update',
  Complete = 'complete',
}

export type Event = {
  type: EventType;
  data: Todo;
};
