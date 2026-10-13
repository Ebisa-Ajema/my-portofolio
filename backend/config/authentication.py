from datetime import timedelta

from django.utils import timezone
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed


class PortfolioAdminTokenAuthentication(TokenAuthentication):
    """Expire dashboard tokens after 12 hours even when their tab stays open."""

    def authenticate_credentials(self, key):
        user, token = super().authenticate_credentials(key)
        if timezone.now() - token.created > timedelta(hours=12):
            token.delete()
            raise AuthenticationFailed("Your session expired. Please sign in again.")
        return user, token
