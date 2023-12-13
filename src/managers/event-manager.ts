import { Event } from '../entities/event';

export type EventListener = (event: Event) => Promise<void>;

const listeners: EventListener[] = [];

export async function emit(event: Event) {
  return Promise.all(listeners.map((listener) => listener(event)));
}

export function subscribe(listener: EventListener) {
  listeners.push(listener);
}
