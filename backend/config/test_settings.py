"""Isolated settings for backend tests when PostgreSQL is unavailable."""

from .settings import *  # noqa: F403

DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}}
CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache", "LOCATION": "portfolio-tests"}}
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
CONTACT_RECEIVER_EMAIL = "owner@example.test"
DEFAULT_FROM_EMAIL = "portfolio@example.test"
