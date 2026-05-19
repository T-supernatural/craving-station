from django.db import models

class Settings(models.Model):
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    opening_time = models.TimeField(default='09:00')
    closing_time = models.TimeField(default='22:00')
    phone = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Settings'
        verbose_name_plural = 'Settings'

    def __str__(self):
        return 'Restaurant Settings'
