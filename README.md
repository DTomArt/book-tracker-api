# Book Tracker API

Book Tracker API is a NestJS backend application with PostgreSQL.
It provides JWT authentication and supports managing books and comments.

## Requirements

- Node.js 22+
- Docker + Docker Compose

## Install

```bash
npm install
```

## Quick Start With Docker

Start the application and initialize the database (migrations + seeds):

```bash
npm run start:docker
```

Stop the containers:

```bash
npm run stop:docker
```

## Manual Run With Docker DB

This option runs the database in Docker and the API locally in development mode.

1. Start PostgreSQL in Docker:

```bash
npm run db:run
```

2. Run migrations and seeds:

```bash
npm run db:setup
```

3. Start the API locally:

```bash
npm run start:dev
```

Full database reset (removes data, recreates the database, runs migrations and seeds):

```bash
npm run db:reset
```

## Example Requests

Example HTTP requests are available in the `requests` folder.
You can use them to quickly test authentication and books endpoints.
