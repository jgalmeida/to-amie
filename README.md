# Todo service

Build a service to manage Todos.

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

## Scripts

`make start` starts the server

`npm test` executes the tests

## Solution explanation

Create TODO

```bash

```

Get TODOS

```bash

```

### Project Structure

#### Routes

- Payload validation and call resource manager to handle business logic.

#### Managers

- Responsible for business logic.
- A manager can call other managers functions but can only call it's entity repository.

#### Repositories

- Interface with the persistence layer, cannot call other entities repositories.
- Can use different adapters to manage the underlying entity.

#### Adapters

- Thin layer to communicate with an external API, database, etc. Usually it's just a set of commons functions (http requests/database connections or transactions).

### Setup / Infrastructure

- Docker and compose are used to setup the development environment.
- ts-node-dev used to watch files do hot reloading and debugging the service.
- Test environment has a dependency on MySQL database which is bootstraped using [testcontainers](https://testcontainers.com/) lib to provide an interface to manage it's lifecycle and access options.

### Data Validation

- Done at route level using [typebox](https://github.com/sinclairzx81/typebox).
- The validation middleware also types the request object after validation.

### Tests

#### Which parts of the application is tested?

- I decided not to to unit tests and only test the API as a black box.
- Data creation and assertion are tested only using the built API endpoints.

### Error Handling

#### How and when are you handling errors?

- All application errors (validation, database, domain) are catched by the error middleware that formats them into a standard format before sending the error response back.

### Documentation

- No batching
- No caching
- No data reuse - i.e if the same request needs the same data, it's being fetched from the DB everytime
