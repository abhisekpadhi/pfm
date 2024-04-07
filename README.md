# PFM

Personal finance management micro-service

## System design

![high level design](./docs/hld.png 'High level design')

-   Read the system design doc [here](./docs/design.md)

## API doc

-   Read the API doc [here](./docs/api.md)
-   Postman collection [here](./docs/postman_collection.json)

## How to setup local dev

1. Setup the following servers

    - Mysql 8.3.0
    - Redis 7.2.4
    - Node.js > 20

2. Update `.env` file

```shell
# Environment Configuration
NODE_ENV="development" # Options: 'development', 'production'
PORT="3000"            # The port your server will listen on
HOST="localhost"       # Hostname for the server

# CORS Settings
CORS_ORIGIN="http://localhost:*" # Allowed CORS origin, adjust as necessary

# Rate Limiting
COMMON_RATE_LIMIT_WINDOW_MS="1000" # Window size for rate limiting (ms)
COMMON_RATE_LIMIT_MAX_REQUESTS="20" # Max number of requests per window per IP

# Database
DB_HOST="127.0.0.1"
DB_USER="root"
DB_PASSWORD="password"
DB_NAME="pfm"

# JWT
JWT_SECRET="notARealSecret"

# Redis
REDIS_URL="redis://localhost"
```

3. Run for development

```shell
npm run dev
```

## Productionisation

1. Build

```shell
npm run build
```

2. Run in prod

```shell
npm run start
```

> Run using `pm2` in prod

## Future scope

-   Instrumentation w/ newrelic/prometheus for app performance monitoring
-   Rate limit tuning per API
-   Dockerisation
