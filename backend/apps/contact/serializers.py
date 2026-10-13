from django.utils.html import strip_tags
from rest_framework import serializers

from .models import ContactMessage


class ContactSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ("name", "email", "subject", "message")

    def validate_name(self, value):
        value = " ".join(strip_tags(value).split())
        if not value:
            raise serializers.ValidationError("Enter your name.")
        return value

    def validate_subject(self, value):
        value = " ".join(strip_tags(value).split())
        if not value:
            raise serializers.ValidationError("Enter a subject.")
        return value

    def validate_message(self, value):
        value = strip_tags(value).strip()
        if not value:
            raise serializers.ValidationError("Enter a message.")
        if len(value) > 5000:
            raise serializers.ValidationError("Messages must be 5,000 characters or fewer.")
        return value
