import logging

from django.conf import settings
from django.core.mail import EmailMessage
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ContactSubmissionSerializer
from .throttles import ContactRateThrottle

logger = logging.getLogger(__name__)


class ContactSubmissionView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ContactRateThrottle]

    def post(self, request):
        serializer = ContactSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        submission = serializer.save()

        if settings.CONTACT_RECEIVER_EMAIL:
            try:
                EmailMessage(
                    subject=f"Portfolio contact: {submission.subject}",
                    body=(
                        f"From: {submission.name}\n"
                        f"Email: {submission.email}\n\n"
                        f"{submission.message}"
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[settings.CONTACT_RECEIVER_EMAIL],
                    reply_to=[submission.email],
                ).send(fail_silently=False)
            except Exception:
                logger.exception("Contact notification email failed for saved message id=%s", submission.pk)

        return Response(
            {"message": "Thanks, your message has been received."},
            status=status.HTTP_201_CREATED,
        )
