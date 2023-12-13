import { Provider } from '../../entities/provider';
import { TodoIstProvider } from './todoist-provider';

export function build(provider: Provider, token: string) {
  switch (provider) {
    case Provider.TODO_IST:
      return new TodoIstProvider(token);
    default:
      throw new Error('NOT IMPLEMENTED');
  }
}
