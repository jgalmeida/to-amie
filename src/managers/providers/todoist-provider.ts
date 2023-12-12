import { request } from '../../adapters/http';
import { Todo } from '../../entities/todo';

interface ProviderContext {
  syncToken: string;
  resourceTypes: string[];
}

export class TodoIstProvider {
  private readonly token: string;
  private readonly baseUrl = 'https://api.todoist.com/sync/v9/sync';

  constructor(token: string) {
    this.token = token;
  }

  async createTodo(ctx: ProviderContext, todo: Todo): Promise<string> {
    const response = await request({
      url: this.baseUrl,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      json: {
        sync_token: ctx.syncToken,
        resource_types: ctx.resourceTypes,
      },
    });

    console.log(response);

    return '';
  }

  async getTodos(ctx: ProviderContext): Promise<Todo[]> {
    const response = await request({
      url: this.baseUrl,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      json: {
        sync_token: ctx.syncToken,
        resource_types: ctx.resourceTypes,
      },
    });

    console.log(response);

    return [];
  }

  async updateTodo(ctx: ProviderContext, todo: Todo): Promise<void> {
    const response = await request({
      url: this.baseUrl,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      json: {
        sync_token: ctx.syncToken,
        resource_types: ctx.resourceTypes,
      },
    });

    console.log(response);
  }
}
