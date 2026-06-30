# FishBook

FishBook is a Spring Boot + React monorepo for browsing fish by season, taste, price level, and anonymous reviews.

## Local Development

### Backend

```bash
cd BE
./gradlew bootRun
```

The backend runs at `http://localhost:8080` and exposes `GET /api/v1/health`.

Default local database settings:

```text
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/fishbook
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=
```

Create the local database before booting:

```bash
createdb fishbook
```

### Frontend

```bash
cd FE
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

`FE/.env`:

```text
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## API

- `GET /api/v1/fish`
- `GET /api/v1/fish/{id}`
- `GET /api/v1/fish/{id}/reviews`
- `POST /api/v1/fish/{id}/reviews`
- `DELETE /api/v1/reviews/{id}`

## Deployment

### Railway

1. Create a Railway PostgreSQL service.
2. Create a Railway backend service from this repository.
3. Set the backend root directory to `BE`.
4. Railway will build the backend with `BE/Dockerfile`. The app listens on `server.port=${PORT:8080}`, so Railway's injected `PORT` is used automatically.
5. Add these environment variables from Railway PostgreSQL:

```text
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:<port>/<database>
SPRING_DATASOURCE_USERNAME=<username>
SPRING_DATASOURCE_PASSWORD=<password>
```

6. Add the frontend origins allowed by CORS:

```text
APP_CORS_ALLOWED_ORIGINS=https://<vercel-project>.vercel.app,https://<your-domain>
```

Keep the local default when running without this variable:
`http://localhost:5173,http://localhost:5174,http://localhost:5175`.

### Vercel

1. Create a Vercel project from this repository.
2. Set the frontend root directory to `FE`.
3. Set the production API URL:

```text
VITE_API_BASE_URL=https://<railway-backend-domain>/api/v1
```

`FE/.env.production.example` contains the same shape for reference.

4. Deploy with the default Vite build command and output directory:

```bash
npm run build
```

```text
dist
```

`FE/vercel.json` rewrites all routes to `index.html`, so React Router deep links such as `/fish/1` keep working after refresh.

### Domain

Connect the purchased domain to Vercel for the frontend. If a separate API domain is needed, point `api.<domain>` to the Railway backend and use that URL in `VITE_API_BASE_URL`.

After the domain is connected, update Railway's `APP_CORS_ALLOWED_ORIGINS` to include the final frontend domain, for example:

```text
APP_CORS_ALLOWED_ORIGINS=https://fishbook.example.com,https://www.fishbook.example.com
```
