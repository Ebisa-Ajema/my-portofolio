# Ebisa Ajema — Full Stack Portfolio

The existing React portfolio remains the public website. Django REST Framework provides published project data and a private contact inbox backed by PostgreSQL. GitHub Pages hosts the frontend; deploy the API separately.

## Stack and structure

- Frontend: React, Vite, Tailwind CSS, GSAP, Three.js / React Three Fiber.
- Backend: Django, Django REST Framework, PostgreSQL, staff-only token-authenticated admin API.
- Optional production services: Redis for shared rate limiting and S3-compatible object storage for uploaded project images.
- `src/`: existing portfolio UI and reusable components.
- `public/images/`: screenshots, icons, and the existing 3D model texture.
- `backend/apps/projects/`: project model, public read API, protected project management API, and initial data migration.
- `backend/apps/contact/`: private contact messages, protected inbox API, validation, email notification, and rate-limited submit API.
- `backend/apps/content/`: validated resume file management.
- `src/admin/`: private dashboard UI, login, overview, project editor, inbox, resume, and settings pages.
- `backend/config/`: Django settings and URLs.

The Vite base remains `/my-portofolio/`. Existing 3D model URLs continue to use `BASE_URL`.

## Local setup

Requirements: Node.js/npm, Python 3.10 or newer, and PostgreSQL. The Python environment is kept outside `backend/`.

```bash
npm ci
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
cp .env.frontend.example .env.local
```

Edit `backend/.env` with your local database password and settings. Edit `.env.local` if the backend uses another local address. Both env files are ignored by Git.

### Create a separate PostgreSQL database

These commands create a new portfolio role and database. They do not modify or reuse an Odoo database. Pick a unique password and put the same value in `backend/.env` as `POSTGRES_PASSWORD`.

```bash
sudo -u postgres psql
```

In the PostgreSQL prompt, substitute a strong local password:

```sql
CREATE ROLE portfolio_user WITH LOGIN PASSWORD 'choose-a-unique-password';
CREATE DATABASE portfolio_db OWNER portfolio_user;
\q
```

If you manage PostgreSQL without `sudo`, use your provider’s role/database creation method instead. The project does not create, reset, or drop databases.

Apply migrations and create an admin login:

```bash
source .venv/bin/activate
python backend/manage.py check
python backend/manage.py migrate
python backend/manage.py createsuperuser
```

Run the services in separate terminals from the repository root:

```bash
source .venv/bin/activate
python backend/manage.py runserver 127.0.0.1:8000
```

```bash
npm run dev
```

The frontend API variable should be `VITE_API_BASE_URL=http://127.0.0.1:8000/api`. Vite reads `.env.local` when it starts; restart it after changing that value.

The private dashboard is inside this same Vite app at `http://localhost:5173/my-portofolio/#/admin/login`. Sign in with the Django superuser username and password. The dashboard uses a browser-tab token that expires after 12 hours and Django staff authorization; a new login replaces the previous token for that account. There is no public registration page. It provides an overview, project management, a private contact inbox, resume upload, and account/API settings. On GitHub Pages the equivalent route is `https://ebisa-ajema.github.io/my-portofolio/#/admin/login` after `VITE_API_BASE_URL` is set to your deployed HTTPS API.

## API and project management

- `GET /api/projects/` returns published projects only. It does not allow public editing.
- `POST /api/contact/` validates and saves a contact message. Contact messages have no public list or detail endpoint.
- `/api/admin/login/` issues an administrator token only to active Django staff accounts. All `/api/admin/*` management routes require that token and staff authorization.
- `GET /api/resume/` exposes the current public resume. Resume/project edits require administrator authentication.
- Resume uploads must be valid PDFs no larger than 10 MB. Project screenshots must be valid JPG, PNG, or WebP images no larger than 5 MB.
- Django Admin is at `/admin/`; log in with the superuser created above.
- Three published project rows are added by the initial data migration. Their existing descriptions and technology lists are preserved. Existing frontend screenshots are used as fallbacks until images are uploaded in Admin.
- In Admin, edit a project, add technologies as a JSON list (for example `["Django", "PostgreSQL"]`), set its publication status, and optionally set GitHub/live demo URLs. No repository or demo links have been invented.
- Project images accept JPG, PNG, or WebP, up to 5 MB. Local development stores them under `backend/media/`.
- Production must use persistent media storage. Configure an S3-compatible bucket and set `USE_S3_MEDIA=true` plus the `AWS_*` values in the backend environment. Do not rely on an ephemeral server disk for uploads.

Try the public project API:

```bash
curl http://127.0.0.1:8000/api/projects/
```

Try contact validation and local console email output (use a real-looking test sender; the `.test` receiver is not a deliverable mailbox):

```bash
curl -i http://127.0.0.1:8000/api/contact/ \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test Recruiter","email":"recruiter@example.test","subject":"Portfolio inquiry","message":"Hello Ebisa"}'
```

The API validates fields on the server, stores messages as unread, limits request bodies, and applies a per-IP anonymous throttle. The default cache is process-local; configure `REDIS_URL` in production so the limit is shared across workers. Messages are reviewable in Django Admin only.

## Email configuration

For local development, leave `EMAIL_HOST` and `EMAIL_HOST_USER` blank. Django uses its console email backend; messages are printed in the backend terminal. Set `CONTACT_RECEIVER_EMAIL` to the intended recipient to exercise notification generation locally. Console output is for testing and does not mean an email was delivered.

For real notifications, set these only in the backend environment using credentials from your SMTP/transactional email provider:

```text
EMAIL_HOST=smtp.example-provider.com
EMAIL_PORT=587
EMAIL_HOST_USER=provider-account
EMAIL_HOST_PASSWORD=provider-secret
EMAIL_USE_TLS=true
DEFAULT_FROM_EMAIL=portfolio@example.com
CONTACT_RECEIVER_EMAIL=your-inbox@example.com
```

The message is saved before notification is attempted, so a mail server failure does not discard it. The visitor sees confirmation that the message was received; check backend logs and Admin if mail delivery needs attention. Never put SMTP credentials in Vite variables.

## CV

No resume PDF is included or generated. Upload your own PDF from **Admin → Resume & Files**. Once available, the public hero shows a Download CV link served through the backend as `Ebisa-Ajema-CV.pdf`. This feature requires the backend and persistent media storage in production.

## Tests and build

```bash
npm run build
source .venv/bin/activate
python backend/manage.py check
python backend/manage.py makemigrations --check --dry-run
python backend/manage.py test apps.projects apps.contact
```

With PostgreSQL configured, Django tests use its test database; the PostgreSQL role must be permitted to create that database. If PostgreSQL is unavailable, the isolated test settings use an in-memory SQLite database instead:

```bash
python backend/manage.py check --settings=config.test_settings
python backend/manage.py makemigrations --check --dry-run --settings=config.test_settings
python backend/manage.py test apps.projects apps.contact --settings=config.test_settings
```

The SQLite mode checks application behavior and migrations but does not verify PostgreSQL connectivity or run migrations against PostgreSQL. Tests cover published-project filtering, staff login and access control, project and message management, resume file validation and delivery, contact validation and persistence, email generation/failure handling, rate limiting, and the absence of a public contact listing endpoint.

## Deployment

### Frontend

GitHub Pages remains configured by the existing workflow on pushes to `main`. It runs `npm ci`, `npm run build`, then publishes `dist/`. Keep the Vite `base` setting `/my-portofolio/`. After choosing your backend host, add a repository Actions variable named `VITE_API_BASE_URL` under **Settings → Secrets and variables → Actions → Variables**, with the HTTPS API origin plus `/api` (for example, `https://your-api-host.example/api`). The workflow passes that variable into the Vite build. If it is unset, the frontend still builds; existing project cards remain as local fallbacks and contact submission reports that the service is not configured.

GitHub Pages has no Django runtime or PostgreSQL database. The admin interface source is public, but all administrative API operations require an authenticated Django staff account; hiding the route is not the security boundary.

### Backend

Choose a Python-compatible host and managed PostgreSQL provider separately; no provider or public API URL is assumed here. Configure environment variables in the host dashboard, use HTTPS, and set:

```text
DJANGO_DEBUG=false
DJANGO_SECRET_KEY=<long-random-secret>
DJANGO_ALLOWED_HOSTS=<your-api-host>
DJANGO_CSRF_TRUSTED_ORIGINS=https://<your-api-host>
FRONTEND_ORIGINS=https://ebisa-ajema.github.io
POSTGRES_DB=<portfolio-database>
POSTGRES_USER=<portfolio-user>
POSTGRES_PASSWORD=<managed-database-password>
POSTGRES_HOST=<managed-database-host>
POSTGRES_PORT=5432
POSTGRES_SSLMODE=require
VITE_API_BASE_URL=https://<your-api-host>/api
ADMIN_LOGIN_RATE_LIMIT=10/minute
```

Run `python manage.py migrate` as a release step and `python manage.py collectstatic --noinput` when required by the chosen host. Start the WSGI app with `gunicorn config.wsgi:application` from the `backend/` directory. Create the Django admin user through a secure one-off command. Keep secrets in the host’s secret manager. Configure `REDIS_URL` for a shared contact throttle and the S3 variables described above for durable project image uploads. Confirm the provider’s proxy and HTTPS settings before enabling secure cookies and SSL redirect (already enabled when `DJANGO_DEBUG=false`).

The existing workflow deploys only the frontend; backend deployment, database provisioning, email provider setup, and image storage still require your choices and credentials. Use HTTPS for the API, put `https://ebisa-ajema.github.io` in `FRONTEND_ORIGINS`, and configure persistent S3-compatible storage for project images and the public resume. The dashboard’s hash routes (`#/admin/login`, `#/admin/dashboard`, and the other `#/admin/*` pages) work with GitHub Pages refreshes. Do not add administrator credentials, database secrets, or SMTP credentials to Vite variables.
