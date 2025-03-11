# FastFood App API

API cho ứng dụng cửa hàng đồ ăn nhanh sử dụng NestJS, Prisma, Stripe và Novu.

## Công nghệ sử dụng

- NestJS: Framework backend NodeJS
- Prisma: ORM hiện đại cho cơ sở dữ liệu
- PostgreSQL: Cơ sở dữ liệu quan hệ
- Redis: Caching và quản lý phiên
- Stripe: Xử lý thanh toán
- Novu: Quản lý thông báo
- MinIO: Lưu trữ đối tượng tương thích S3 (hình ảnh, file)
- Docker: Containerization

## Chức năng

- Đăng ký, đăng nhập, quản lý người dùng
- Quản lý danh mục và sản phẩm
- Đặt hàng và thanh toán trực tuyến
- Quản lý đơn hàng
- Tải lên và quản lý hình ảnh sản phẩm
- Thông báo thời gian thực

## Cài đặt

### Yêu cầu

- Node.js (>= 18.x)
- Docker và Docker Compose
- Yarn

### Thiết lập dự án

1. Clone dự án và cài đặt các phụ thuộc:

```bash
git clone <repository-url>
cd fastfood-app
yarn install
```

2. Thiết lập biến môi trường:

```bash
cp .env.example .env
# Chỉnh sửa các biến môi trường trong file .env
```

3. Khởi chạy với Docker:

```bash
yarn docker:build
yarn docker:up
```

4. Tạo schema cơ sở dữ liệu:

```bash
yarn prisma:migrate:dev
```

5. Chạy ứng dụng (development):

```bash
yarn start:dev
```

## Truy cập các dịch vụ

Sau khi khởi chạy dự án với Docker, bạn có thể truy cập các dịch vụ sau:

- REST API: http://localhost:3000
- Swagger UI API Docs: http://localhost:3000/api
- MinIO Console: http://localhost:9001 (đăng nhập với MINIO_ROOT_USER/MINIO_ROOT_PASSWORD từ file .env)
- pgAdmin: http://localhost:5050 (đăng nhập với admin@example.com/admin)

## API Documentation

Sau khi chạy ứng dụng, bạn có thể truy cập Swagger UI để xem tài liệu API:

```
http://localhost:3000/api
```

## Scripts hữu ích

- `yarn start:dev`: Khởi chạy ứng dụng với chế độ dev (watch mode)
- `yarn build`: Build ứng dụng
- `yarn start:prod`: Khởi chạy ứng dụng đã được build
- `yarn prisma:studio`: Mở Prisma Studio để quản lý dữ liệu
- `yarn prisma:migrate:dev`: Tạo và áp dụng migration
- `yarn docker:up`: Khởi chạy dịch vụ Docker
- `yarn docker:down`: Dừng dịch vụ Docker

## Cấu trúc thư mục

```
fastfood-app/
├── prisma/               # Schema Prisma và migrations
├── src/
│   ├── common/           # Các thành phần dùng chung
│   ├── config/           # Cấu hình ứng dụng
│   ├── modules/          # Các module ứng dụng
│   │   ├── auth/         # Xác thực và phân quyền
│   │   ├── categories/   # Quản lý danh mục
│   │   ├── products/     # Quản lý sản phẩm
│   │   ├── orders/       # Quản lý đơn hàng
│   │   ├── payments/     # Thanh toán
│   │   ├── users/        # Quản lý người dùng
│   │   └── notifications/# Thông báo
│   ├── prisma/           # PrismaService
│   ├── app.module.ts     # Module chính
│   └── main.ts           # Điểm vào ứng dụng
└── docker-compose.yml    # Cấu hình Docker
```

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
