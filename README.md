# E-Commerce - A Nest.js Backend Application

<a href="https://typeorm.io/">![TypeORM](https://img.shields.io/static/v1?label=&message=TypeORM&color=blue&style=for-the-badge&logo=data:image/png;base64,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)</a>
<a href="https://docs.nestjs.com/">![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)</a>
<a href="https://graphql.org/">![GraphQL](https://img.shields.io/badge/-GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)</a>
<a href="https://docs.docker.com/get-started/">![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)</a>
<a href="https://expressjs.com/de/starter/hello-world.html">![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)</a>
<a href="https://www.apollographql.com/docs/apollo-server/">![Apollo-GraphQL](https://img.shields.io/badge/-ApolloGraphQL-311C87?style=for-the-badge&logo=apollo-graphql)</a>
<a href="https://typegraphql.com/docs/introduction.html">![Type-graphql](https://img.shields.io/badge/-TypeGraphQL-%23C04392?style=for-the-badge)</a>
<a href="https://www.typescriptlang.org/docs/">![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)</a>
<a href="https://dev.mysql.com/doc/relnotes/mysql/8.0/en/news-8-0-32.html">![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)</a>

---

Hi there! 👋
I developed this Nest.js E-Commerce application. Nest.js is a popular Node.js framework for building scalable and efficient server-side applications. This project provides the backend to my <a href="https://nextjs.org/showcase">![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)</a> frontend.


## ✅ Features:
- Authentication & Authorization (RBAC)
- Modules for entities such as `Product`, `Order`, `User`, `Address` etc...
- A custom many-to-many solution with additional columns for relationship of `Product` and `Order` (`n-to-n`)
- Resolvers providing the functionality to query and mutate shop data 
- ...and an SMTP service to send customer emails upon certain account actions)

This project serves as API-server utilizing TypeORM, Type-GraphQL, Nodemailer, etc... and provides the backend for my upcoming Frontend project.

---

## 📃 Requirements
- Make sure that you have Docker and Docker Compose installed
    - Windows or macOS:
      [Install Docker Desktop](https://www.docker.com/get-started)
    - Linux: [Install Docker](https://www.docker.com/get-started) and then
      [Docker Compose](https://github.com/docker/compose)

## 🚀 Running Locally
Clone the project, navigate into project directory & install dependencies:
```bash
  git clone https://github.com/erenustun/nest-shop && cd nest-shop && npm i
```

### Environment Variables

- Copy `.env.example` to `.env`:
```bash
  cp .env.example .env
```

### Running the docker container:

The root directory of this project contains a `docker-compose.yml` which describes the configuration for the backend services.
The docker container can be run in a local environment by going into the root directory and executing:
```bash
docker compose up -d
```

#### Stopping the docker container:
To stop the container execute:
```bash
docker compose stop
```

To stop **and remove** the container (including container volumes) execute:
```bash
docker compose down -v
```

### Start application in development mode
```bash
npm run start:dev
```

### GraphQL Playground (Documentation)
```bash
http://localhost:3001/graphql
```

### Adminer (Database - Web GUI)
Adminer (formerly phpMinAdmin) is a full-featured database management tool.
```bash
http://localhost:8080/
```
#### Default credentials:
- server: `db`
- username: `nest`
- password: `nest`
- database: `shop_data`
- Credentials can be changed in `.env` in project root

### 🔖 Issues
#### *When experiencing issues with the email functionality, please run `npm run build` after you started the app `npm run start:dev`.