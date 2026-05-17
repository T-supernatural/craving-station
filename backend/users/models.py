from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True, null=True)
    role = models.CharField(
        max_length=20,
        choices=[('customer', 'Customer'), ('admin', 'Admin')],
        default='customer',
    )
    profile_image = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.email or self.username
