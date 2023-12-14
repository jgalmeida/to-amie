import { Event } from '../entities/event';

export type EventListener = (event: Event) => Promise<void>;

const listeners: EventListener[] = [];

export function emit(event: Event) {
  /*
   * Mimic async event propagation
   */
  setTimeout(
    () => Promise.all(listeners.map((listener) => listener(event))),
    2000,
  );
}

export function subscribe(listener: EventListener) {
  listeners.push(listener);
}
