import { TODO_IST_TOKEN } from '../../constants';
import { Provider } from '../../entities/provider';
import { TodoIstProvider } from './todoist-provider';

export function build(provider: Provider) {
  switch (provider) {
    case Provider.TODO_IST:
      return new TodoIstProvider(TODO_IST_TOKEN);
    default:
      throw new Error('NOT IMPLEMENTED');
  }
}
