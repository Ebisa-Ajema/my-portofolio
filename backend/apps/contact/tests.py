from django.core import mail
from django.core.cache import cache
from django.test import TestCase, override_settings
from unittest.mock import patch
from rest_framework.test import APIClient

from .models import ContactMessage


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    CONTACT_RECEIVER_EMAIL="owner@example.test",
    DEFAULT_FROM_EMAIL="portfolio@example.test",
    REST_FRAMEWORK={"DEFAULT_THROTTLE_RATES": {"contact": "100/hour"}, "UNAUTHENTICATED_USER": None},
)
class ContactApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.payload = {
            "name": "Recruiter",
            "email": "recruiter@example.com",
            "subject": "Portfolio opportunity",
            "message": "I would like to discuss a role.",
        }

    def test_valid_submission_is_stored_and_notifies_configured_receiver(self):
        response = self.client.post("/api/contact/", self.payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(ContactMessage.objects.count(), 1)
        self.assertEqual(ContactMessage.objects.get().status, ContactMessage.Status.UNREAD)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["owner@example.test"])
        self.assertEqual(mail.outbox[0].reply_to, ["recruiter@example.com"])

    def test_invalid_email_is_rejected_and_not_saved(self):
        response = self.client.post(
            "/api/contact/", {**self.payload, "email": "not-an-email"}, format="json"
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_contact_messages_cannot_be_listed_publicly(self):
        ContactMessage.objects.create(**self.payload)

        response = self.client.get("/api/contact/")

        self.assertEqual(response.status_code, 405)
        self.assertEqual(ContactMessage.objects.count(), 1)

    @patch("apps.contact.views.EmailMessage.send", side_effect=OSError("mail service unavailable"))
    def test_mail_failure_does_not_discard_saved_message(self, _send):
        with patch("apps.contact.views.logger.exception"):
            response = self.client.post("/api/contact/", self.payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(ContactMessage.objects.count(), 1)

    def test_contact_submission_is_rate_limited(self):
        cache.clear()
        with patch("apps.contact.throttles.ContactRateThrottle.get_rate", return_value="1/minute"):
            first = self.client.post("/api/contact/", self.payload, format="json")
            second = self.client.post("/api/contact/", self.payload, format="json")

        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 429)
