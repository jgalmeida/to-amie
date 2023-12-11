import { setTimeout } from 'timers/promises';

export function sleep(ms = 1000): Promise<void> {
  return setTimeout(ms);
}
