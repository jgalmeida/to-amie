import * as eventManager from '../managers/event-manager';
import { onEventWriteTodoIst } from './todo-ist-writter';

export function initListeners() {
  eventManager.subscribe(onEventWriteTodoIst);
}
