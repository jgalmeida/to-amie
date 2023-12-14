# Todo service

Build a service to manage Todos.

## Solution explanation

This service ilustrates an integration with the TodoIST provider.

### Project Structure

- src
  - adapters - Thin layer to communicate with an external API, database, etc.
  - entities - Types definition for entities used in the service.
  - managers - Responsible for business logic. Interacts with it's entity repository or other managers
  - repositories - Interface with persistence layer, can use adapters.
  - jobs - Background jobs, for example, Cron.
  - listeners - Background processing of events.
  - middlewares - Error handling, service lifecycle, etc
  - migrations - Database migrations.
  - graphql - generated - Generated Typescript graphql schema. - resolvers - Resolvers implementation. - typedefs - Graphql schemas.
- test
  - api - API tests
  - fixtures - Tools to generate data for the tests.
  - tools - Interaction with database, common functions such as truncate or batch insert, etc

### Setup / Infrastructure

- Docker and compose are used to setup the development environment.
- ts-node-dev used to watch files do hot reloading and debugging the service.
- GraphQL types are generated automatically based on the schema.
- Test environment has a dependency on MySQL database which is bootstraped using [testcontainers](https://testcontainers.com/) lib to provide an interface to manage it's lifecycle and access options.

### Data Model

- Connections - Represents a connection between an account and a provider. Contains the `sync_token` and the status of the connection.
- Lists - Just a set of an account Todo Lists - API not implemented.
- TodoLink - Link between a local Todo and a Provider todo, for a connection. Associates a local ID with a provider ID.
- Todo - Local todo representation

### Initial Remarks

- User authentication/registration wasn't implemented, hence the usage of the API token.
- The data model is prepared to be multi tenant with an `account` being the tenant.
- There is an [hardcoded](https://github.com/jgalmeida/to-amie/blob/main/src/constants.ts#L26-L30) `ACCOUNT_ID`` to mimic an existing account.
  - This account is used as the [graphql context](https://github.com/jgalmeida/to-amie/blob/main/src/app.ts#L34-L37)
- During the initial service boot, the database is [seeded](https://github.com/jgalmeida/to-amie/blob/main/src/adapters/mysql.ts#L67) with a connection using this account and the `TODOIST_TOKEN` token.
- Tokens/Secrets aren't encrypted, but they should :)

### Queries

- `todo(id)` - Fetches a single todo by id
- `todos(limit, after)` - Fetches multiple todos. Supports pagination, limit and grouping.

### Mutations

- `createTodo` - Creates a todo.
  - Has 4 status:
    - Stopped - When it's first created.
    - Warming - When the initial local <-> provider sync is being done.
    - Ready - When it's ready to for the incremental sync.
    - Syncing - When it's syncing.
- `updateTodo` - Updates todo name.
- `completeTodo` - Marks todo as completed.
- `startSync` - Would be called by the user after installing the integration.

### Sync Engine

- Todo operations are propagated as events. [`todo-manager`](https://github.com/jgalmeida/to-amie/blob/main/src/managers/todo-manager.ts) [emits events](https://github.com/jgalmeida/to-amie/blob/main/src/managers/todo-manager.ts#L51) for each operation.
- [`sync-manager`](https://github.com/jgalmeida/to-amie/blob/main/src/managers/sync-manager.ts) the main responsible for the sync logic.
- `todo-ist-writter` is listening for the changes and propagating to TodoIST provider.
- The objective of this event/listener pattern is to ilustrate the ability to integrate with other providers.
  - Ideally the events would be generated using an Outbox Pattern to have transaction guarantee that each change generates an event.
- The listeners would be subscribed to a messaging system (RabbitMQ, Kafka, etc)
- The `providers` have a set of shared functions, so the system can dynamically instantiate the correct provider for an integration. Example, [see](https://github.com/jgalmeida/to-amie/blob/main/src/managers/providers/index.ts) [`todoist-provider`](https://github.com/jgalmeida/to-amie/blob/main/src/managers/providers/todoist-provider.ts).
- The [`IntegrationTodo`](https://github.com/jgalmeida/to-amie/blob/main/src/entities/todo.ts#L23) entity represents the interface between the service and a provider implementation.
- The `startSync` mutation [initializes the sync process](https://github.com/jgalmeida/to-amie/blob/main/src/managers/sync-manager.ts#L31)
  - An `Inbound` sync, syncing todos from the provider to the service.
  - An `Outbound` sync, syncing todos from the service to the provider.
  - **Completed or deleted todos are ignored.**
  - After the initial sync, the connection starts doing incremental syncs, picked up by a cron job.
    - Connection status get's updated to `syncing` and after the incremental sync is done goes back to `ready`

### Jobs

- There is a job doing periodic incremental syncs for all connected connections.

### Tests

- The whole test setup with test containers and test app is done, but no tests are implemented.
- I would use mocks to avoid external calls to the provider service and fixtures to generate test data.

### Improvements

- Multi stage docker file for production/dev
- Implement oauth flow to enable users to install this integration.
  - secrets and token management and encryption.
- Sync should be done incrementally, in pages. A message queue can be used to paginate each part of a sync.
- Error handling in the middle of a sync process, to enable resume.
- Implement queues to control sync for different providers.
- Use batching to create/update todos locally.
- Use batching when doing incremental sync, buffer operations and do a single call.
- Do rate limit control/error handling.
- Resource locking, both at connection and todo level.
  - This is particularly important when syncing a connection as incremental sync tokens are being used and state can be lost.
- Webhooks sync functionality for providers that have that feature but don't have incremental sync API's.
- Fine tune database indexes.
- Use database transactions where needed (multiple database operations ina single request)
- Resources caching, e.g. avoid going multiple times to the database fo fetch the same resource.
- Service metrics.
- Logging, create a child logger for each request and propagate through the code.

---

## Scripts

Create `.env` file and add `TODOIST_TOKEN=<your-token>`

`make start` starts the server
`npm run gen-ts` to run codegen.
`npm run build:watch` to build Typescript.

`http://localhost:3000/` has a graphql UI.

`npm test` executes the tests

---

## Requirements

- Features

  - [ ] API to query Todos (potentially many!)
    - Query Todos that are not done
    - Todos can be grouped in lists
  - [ ] API to add a Todo
  - [ ] API to update Todos
    - Mark Todos as done
  - [ ] We would like you to integrate with another service provider. It can be any Todo service (e.g. Microsoft Todo APIs), or you can also use a mock provider. Todos should be kept in sync between our service and the third-party integration
    - Todos created in the third-party integration should always be created in our service
    - The status of todos should always be in sync between our service and the integration

- Tech
  - If possible use a relational DB, PostgreSQL would be perfect!
  - Provide data model for Todos

Bonus:

- Let's create GraphQL APIs
- typescript would be great, but most common languages are okay

> Note: We expect you to treat the challenge as a real world production app development that is meant to:
> Scale to 10+ engineers contributing simultaneous
> Wherever you might have to take shortcuts point it out and explain what you would do differently!
> We would like you to take assumptions and decisions of how the product and the third-party integration should work, if needed you can highlight and explain decisions in a README inside the project.
