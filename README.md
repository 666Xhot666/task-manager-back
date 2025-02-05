# Task Manager Backend

[![NestJS](https://img.shields.io/badge/NestJS-v10-red.svg)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5-blue.svg)](https://www.typescriptlang.org)
[![MySQL](https://img.shields.io/badge/MySQL-v8-blue.svg)](https://www.mysql.com)
[![Redis](https://img.shields.io/badge/Redis-v7-red.svg)](https://redis.io)

A high-performance, scalable backend for project and task management built with NestJS. Features real-time updates via WebSockets, robust caching with Redis, and comprehensive monitoring using Prometheus and Grafana.

## 🚀 Features

- **Project Management**: Create and manage projects with team assignments
- **Task Tracking**: Full CRUD operations for tasks with status tracking
- **Real-time Updates**: WebSocket integration for instant task notifications
- **Role-based Access**: Granular permissions for Admins, Managers, and Performers
- **Performance Monitoring**: Prometheus metrics and Grafana dashboards
- **Caching**: Redis-based caching for improved performance
- **Audit Logging**: Comprehensive activity tracking
- **Email Notifications**: Async email notifications using message queue

## 🛠 Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MySQL 8.0
- **ORM**: TypeORM
- **Caching**: Redis
- **Message Queue**: BullMQ
- **Monitoring**: Prometheus & Grafana
- **WebSockets**: Socket.IO
- **Documentation**: Swagger/OpenAPI

## 🏗 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/task-manager-back.git
cd task-manager-back
```

2. Create required data directories:
```bash
mkdir -p data/{db,grafana,redis,redisinsight}
```

3. Install dependencies:
```bash
npm install
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Start the infrastructure services:
```bash
npm run docker:infra
```
6. Start the development server:
```bash
npm run start:dev
```

## 🔧 Available Scripts

- `npm run start:dev` - Start the development server
- `npm run docker:infra` - Start MySQL, Redis, and other infrastructure services
- `npm run build` - Build the application
- `npm run test` - Run tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint

## 📚 API Documentation

Once the server is running, you can access the Swagger documentation at:
```
http://localhost:3000/api
```

## 📊 Monitoring

Access monitoring dashboards at:
- Grafana: `http://localhost:3001`
- Prometheus: `http://localhost:9090`
