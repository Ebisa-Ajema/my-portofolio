# Deployment guide

This repository deploys the React/Vite frontend to GitHub Pages and runs Django as a separate API service. The backend and database have only been prepared here; neither is deployed by this guide or by the GitHub Pages workflow.

## Deploy the frontend to GitHub Pages

The existing `.github/workflows/deploy.yml` builds and publishes the frontend when a commit reaches `main`. The Vite base path must remain `/my-portofolio/` for the project site URL:

`https://ebisa-ajema.github.io/my-portofolio/`

Once the backend is running, set a repository Actions **variable** named `VITE_API_BASE_URL` at **Settings → Secrets and variables → Actions → Variables**. Its value is the HTTPS API origin followed by `/api`, for example `https://your-api-host.example/api`. It is public configuration, so do not put credentials or secrets in it. The workflow injects it into the production build. If it is empty, the frontend still builds and displays its local project fallbacks, but API-powered contact, resume, and admin features are unavailable.

To publish future frontend work, commit and push it to `main`; GitHub Actions will build and deploy it. Check the **Actions** tab for the `Deploy React Portfolio` workflow result. A successful push means the change is on GitHub; the Pages site is deployed only after that workflow succeeds.

## Deploy the Django API and PostgreSQL

### Recommended setup

For a straightforward first deployment, use a **Render Python web service** for Django and a separate **Render PostgreSQL** database. Render documents Django deployments and managed PostgreSQL connections in its [Django deployment guide](https://render.com/docs/deploy-django) and [PostgreSQL guide](https://render.com/docs/postgresql). Choose a paid database plan with backups appropriate for data you need to retain. You can also use another Django host and managed PostgreSQL provider; configure the same environment variables there.

The app and database are separate services. Creating them does not require changing or dropping any existing local database. If you later migrate existing portfolio data, make a backup and use a deliberate data migration; Django migrations below only apply the app schema to the database URL configured for the backend.

### Create the services

1. Create a managed PostgreSQL database and a Python web service connected to this repository.
2. Set the backend service's **Root Directory** to `backend`.
3. Use this **Build Command**:

   ```bash
   pip install -r requirements.txt && python manage.py collectstatic --noinput
   ```

4. Use this **Start Command**:

   ```bash
   gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
   ```

5. Copy the database's internal host, database name, username, password, and port into the service's environment variables. Use the provider's internal connection address when the app and database share a provider, and require SSL for external database connections.
6. Set environment variables in the host dashboard. Do not commit the values or put them in frontend build variables:

   ```text
   DJANGO_DEBUG=false
   DJANGO_SECRET_KEY=<generate-a-long-random-secret>
   DJANGO_ALLOWED_HOSTS=<your-api-service-hostname>
   DJANGO_CSRF_TRUSTED_ORIGINS=https://<your-api-service-hostname>
   FRONTEND_ORIGINS=https://ebisa-ajema.github.io
   POSTGRES_DB=<managed-database-name>
   POSTGRES_USER=<managed-database-user>
   POSTGRES_PASSWORD=<managed-database-password>
   POSTGRES_HOST=<managed-database-host>
   POSTGRES_PORT=5432
   POSTGRES_CONN_MAX_AGE=60
   POSTGRES_SSLMODE=require
   CONTACT_RATE_LIMIT=5/hour
   ADMIN_LOGIN_RATE_LIMIT=10/minute
   ```

   `DJANGO_ALLOWED_HOSTS` takes hostnames without `https://`. `DJANGO_CSRF_TRUSTED_ORIGINS` takes full origins including `https://`. The public portfolio origin belongs in `FRONTEND_ORIGINS` for CORS. Add any custom frontend domain there too.

7. Configure uploaded project images and the resume to use durable object storage before accepting production uploads. The local filesystem is not durable on many app hosts. Set `USE_S3_MEDIA=true` and the `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_STORAGE_BUCKET_NAME`, `AWS_S3_REGION_NAME`, and, if needed, `AWS_S3_ENDPOINT_URL` values for an S3-compatible bucket. The backend returns signed object URLs, so the bucket can remain private; keep the signing credentials only in the backend environment.
8. For multiple web workers, set `REDIS_URL` to a managed Redis-compatible service so contact throttling is shared between workers. It is optional for a single-process deployment.
9. If contact form email notifications are wanted, configure the SMTP variables (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS`, `DEFAULT_FROM_EMAIL`, and `CONTACT_RECEIVER_EMAIL`) in the backend host only.

### Migrate and create an administrator

After the backend service has its production environment configured, run these commands from its `backend` root using the host's one-off command or shell:

```bash
python manage.py migrate
python manage.py check --deploy
python manage.py createsuperuser
```

`migrate` applies the checked-in Django migrations to the database named by the production `POSTGRES_*` variables. Verify the host dashboard shows the intended database before running it. It does not delete or recreate the database. Use an interactive or otherwise secure one-off command for `createsuperuser`; never put the administrator password in source control or a frontend variable.

Django admin will be available at `https://<your-api-service-hostname>/admin/`. The portfolio's separate admin dashboard is at `https://ebisa-ajema.github.io/my-portofolio/#/admin/login` after `VITE_API_BASE_URL` is configured and the frontend has been redeployed.

## Test the deployed connection

1. Check `https://<your-api-service-hostname>/api/projects/`. It should return JSON (an empty list is valid before projects are published).
2. Check `https://<your-api-service-hostname>/api/resume/`. It should report whether a PDF has been uploaded.
3. Open the portfolio and submit a test contact message. Confirm it appears in Django Admin under contact messages. If SMTP is configured, verify delivery separately.
4. Sign in to the portfolio admin dashboard and check projects, messages, and resume actions. The dashboard uses the backend API; Django Admin is also available at `/admin/`.
5. Use the browser developer console/network panel if a request fails. Confirm the API URL is HTTPS, its host is in `DJANGO_ALLOWED_HOSTS`, and `https://ebisa-ajema.github.io` is in `FRONTEND_ORIGINS`.

## Troubleshooting

- **Pages shows an old version or the workflow failed:** inspect the latest GitHub Actions run. The Pages deploy happens after a successful push-triggered build; verify the repository's Pages source is GitHub Actions.
- **Frontend assets are missing or links lead to the wrong path:** keep `base: '/my-portofolio/'` in `vite.config.js` and use the Pages URL with `/my-portofolio/`.
- **API calls fail with CORS errors:** set `FRONTEND_ORIGINS=https://ebisa-ajema.github.io` (and any custom frontend origin), then redeploy Django. CORS origins contain the origin only, without `/api` or a trailing path.
- **API responds with 400/DisallowedHost:** set `DJANGO_ALLOWED_HOSTS` to the backend hostname without a scheme and redeploy.
- **Production startup complains about the secret key or database:** configure `DJANGO_SECRET_KEY` and all `POSTGRES_*` values in the backend service. Do not turn `DJANGO_DEBUG` on in production.
- **Admin CSS is missing:** confirm the build command ran `collectstatic --noinput`, WhiteNoise is installed, and `/static/` is served by the Django service.
- **Uploads disappear:** configure S3-compatible media storage; `backend/media/` is ignored by Git and local service disks may be temporary.
- **Contact messages save but no email arrives:** check backend logs and SMTP settings. A saved message remains in Django Admin if sending the notification fails.
- **Contact rate limiting resets or differs across instances:** configure a shared Redis-compatible `REDIS_URL`.

## Current deployment status

The local frontend production build and Django checks have been run. These changes are awaiting review and confirmation before commit and push. The backend, production PostgreSQL database, GitHub Pages update, and any external storage/email services are not deployed or provisioned by this repository change.
