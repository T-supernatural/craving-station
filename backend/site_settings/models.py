from django.conf import settings
from django.db import models


class RestaurantSettings(models.Model):
    restaurant_name = models.CharField(max_length=255, blank=True, null=True)
    restaurant_description = models.TextField(blank=True, null=True)
    restaurant_address = models.CharField(max_length=500, blank=True, null=True)
    restaurant_phone = models.CharField(max_length=100, blank=True, null=True)
    restaurant_email = models.EmailField(blank=True, null=True)
    delivery_fee = models.PositiveIntegerField(default=1500)
    accept_orders = models.BooleanField(default=True)
    accept_reservations = models.BooleanField(default=True)
    opening_hours = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Restaurant Settings'
        verbose_name_plural = 'Restaurant Settings'

    def __str__(self):
        return 'Restaurant settings'


class Testimonial(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='testimonials')
    author_name = models.CharField(max_length=150)
    content = models.TextField()
    rating = models.PositiveSmallIntegerField(default=5)
    is_featured = models.BooleanField(default=False)
    approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Testimonial'
        verbose_name_plural = 'Testimonials'

    def __str__(self):
        return f'{self.author_name} — {self.rating} stars'
