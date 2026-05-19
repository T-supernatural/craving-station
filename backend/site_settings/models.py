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
