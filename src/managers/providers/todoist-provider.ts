import { v4 } from 'uuid';
import { request } from '../../adapters/http';
import { IntegrationTodo } from '../../entities/todo';

/*
 * To improve this class should use batching
 * each function call create/complete/update could add the command
 * to a buffer
 * Then, a sync function would be called to batch send all commands
 */
interface ProviderContext {
  syncToken: string;
}

type TodoIST = {
  id: string;
  checked: boolean;
  content: string;
  is_deleted: boolean;
  added_at: string;
};

interface IncrementalSyncResponse {
  items: TodoIST[];
  full_sync: boolean;
  temp_id_mapping: Record<string, string>;
  sync_token: string;
}

interface FindManyResponse {
  syncToken: string;
  todos: IntegrationTodo[];
}

interface CreateResponse {
  syncToken: string;
  id: string;
}

interface UpdateResponse {
  syncToken: string;
}

export class TodoIstProvider {
  private readonly token: string;
  private readonly baseUrl = 'https://api.todoist.com/sync/v9/sync';

  constructor(token: string) {
    this.token = token;
  }

  async findMany(ctx: ProviderContext): Promise<FindManyResponse> {
    const response = await this.doRequest({
      syncToken: ctx.syncToken,
    });

    return {
      syncToken: response.sync_token,
      todos: response.items.map(reverseTransform),
    };
  }

  async create({
    ctx,
    todo,
  }: {
    ctx: ProviderContext;
    todo: IntegrationTodo;
  }): Promise<CreateResponse> {
    const tempId = v4();
    const response = await this.doRequest({
      syncToken: ctx.syncToken,
      commands: [
        {
          type: 'item_add',
          temp_id: tempId,
          uuid: v4(),
          args: transform(todo),
        },
      ],
    });

    return {
      syncToken: response.sync_token,
      id: response.temp_id_mapping[tempId],
    };
  }

  async update({
    ctx,
    id,
    todo,
  }: {
    ctx: ProviderContext;
    id: string;
    todo: IntegrationTodo;
  }): Promise<UpdateResponse> {
    const response = await this.doRequest({
      syncToken: ctx.syncToken,
      commands: [
        {
          type: 'item_update',
          uuid: v4(),
          args: {
            id: todo.id,
            content: todo.name,
          },
        },
      ],
    });

    return {
      syncToken: response.sync_token,
    };
  }

  async complete({
    ctx,
    id,
  }: {
    ctx: ProviderContext;
    id: string;
    todo: IntegrationTodo;
  }): Promise<UpdateResponse> {
    const response = await this.doRequest({
      syncToken: ctx.syncToken,
      commands: [
        {
          type: 'item_complete',
          uuid: v4(),
          args: {
            id,
          },
        },
      ],
    });

    return {
      syncToken: response.sync_token,
    };
  }

  private async doRequest<T>({
    syncToken = '*',
    commands,
  }: {
    syncToken?: string;
    commands?: any[];
  }): Promise<IncrementalSyncResponse> {
    return request<IncrementalSyncResponse>({
      url: this.baseUrl,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      json: {
        sync_token: syncToken,
        resource_types: ['items'],
        ...(commands && { commands }),
      },
    });
  }
}

export function transform(todo: IntegrationTodo): TodoIST {
  return {
    id: todo.id,
    checked: todo.completed,
    content: todo.name,
    is_deleted: false,
    added_at: todo.createdAt.toISOString(),
  };
}

export function reverseTransform(todoIst: TodoIST): IntegrationTodo {
  return {
    id: todoIst.id,
    name: todoIst.content,
    completed: todoIst.checked,
    isDeleted: todoIst.is_deleted,
    createdAt: new Date(todoIst.added_at),
  };
}
