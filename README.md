# Book Tracker API

Book Tracker API is a NestJS backend application backed by PostgreSQL.

It provides JWT-based authentication and allows users to manage books and comments.

## Tech Stack

- **TypeScript**
- **NestJS**
- **TypeORM**
- **PostgreSQL**
- **Jest**
- **Supertest**
- **Docker / Docker Compose**
- **JWT**

## Features

- Create, read, update and delete books
- Book fields: title, author, ISBN, number of pages, and rating (1–5)
- ISBN validation
- Cursor-based pagination for the books list
- Add multiple comments to a book
- The books list includes the 5 latest comments for each book
- JWT authentication
- Authenticated users can create comments on any book
- Only the book owner can update or delete a book
- Request validation using NestJS validation pipes
- PostgreSQL persistence
- Unit, integration, and end-to-end tests

### Authentication

Books and comments can be read without authentication.

Creating a book requires a valid access token. Only the owner of a book can update or delete it.

Creating a comment requires authentication, but the user does not need to be the owner of the book.

Only the login endpoint is implemented as part of the authentication API. Full user registration and account management are outside the scope of this assignment.

## Architecture

The application consists of two Docker containers:

- **API** — NestJS application
- **PostgreSQL** — application database

The API can either be run locally while PostgreSQL runs in Docker, or both services can be started using Docker Compose.

The books list uses cursor-based pagination rather than large `OFFSET` values. This allows the API to remain efficient when working with a large number of records.

## Requirements

- Node.js 22+
- Docker
- Docker Compose

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

## Quick Start with Docker

Start the API and PostgreSQL database, run migrations and seed the database:

```bash
npm run start:docker
```

Stop the containers:

```bash
npm run stop:docker
```

## Manual Run with PostgreSQL in Docker

This option runs PostgreSQL in Docker while the NestJS API runs locally in development mode.

### 1. Start the database

```bash
npm run start:db
```

Alternatively, the setup can be performed in two steps:

```bash
npm run db:run
npm run db:setup
```

### 2. Start the API

```bash
npm run start:dev
```

### Reset the database

To remove the existing data, recreate the database, run migrations and execute the seed scripts:

```bash
npm run db:reset
```

## Seed Data

The project contains two seed scripts.

### `seed-user.ts`

Creates a test user that can be used to authenticate against the API:

- Username: `Tom`
- Password: `secretpass`

### `seed-demo-data.ts`

Creates demo data containing:

- 25 books
- 10 users
- 0 comments for the first book
- 1 comment for the second book
- 10 comments for the third book
- 1–10 comments for the remaining books
- All demo users have the password `secretpass`

This data is intended to make it easy to test pagination, comments and ownership-related behaviour.

## API Examples

Example HTTP requests are available in the `requests` directory.

The recommended order is:

1. Open `auth.http` and log in to obtain an access token that is valid for 2 hours.
2. Use the token in `books-write.http` to test authenticated write operations.
3. Use `books-read.http` to test public read operations and pagination.

The request files can be used with the VS Code REST Client extension or IntelliJ HTTP Client.

### Main endpoints

| Method   | Endpoint              | Authentication |
| -------- | --------------------- | -------------- |
| `POST`   | `/auth/login`         | No             |
| `GET`    | `/auth/me`            | Yes            |
| `GET`    | `/books`              | No             |
| `GET`    | `/books/:id`          | No             |
| `POST`   | `/books`              | Yes            |
| `PATCH`  | `/books/:id`          | Yes + owner    |
| `DELETE` | `/books/:id`          | Yes + owner    |
| `POST`   | `/books/:id/comments` | Yes            |

`GET /books` supports cursor-based pagination and returns the latest 5 comments for each book.

## Tests

The project contains unit, integration and end-to-end tests.

Run unit tests:

```bash
npm run test:unit
```

Run integration tests:

```bash
npm run test:integration
```

Run end-to-end tests:

```bash
npm run test:e2e:db
```

The E2E tests use the database and therefore require the PostgreSQL test environment to be available.

The test suite covers, among other things:

- authentication and access tokens
- authenticated API requests
- request validation
- book creation
- books listing and pagination
- database integration
- end-to-end API flows

## Database

PostgreSQL is used as the persistent database. TypeORM is used as the ORM and database access layer. Database schema changes are managed through migrations.
