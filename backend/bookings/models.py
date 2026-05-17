from django.db import models

class Booking(models.Model):
    SERVICE_CHOICES = [
        ('catering', 'Catering Service'),
        ('custom_cake', 'Custom Cake Order'),
        ('event', 'Event Booking'),
    ]

    client_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    service_type = models.CharField(max_length=50, choices=SERVICE_CHOICES, default='catering')
    event_date = models.DateField()
    event_time = models.TimeField()
    guest_count = models.PositiveIntegerField(default=1)
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=30, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-event_date', '-created_at']

    def __str__(self):
        return f'{self.service_type.title()} booking for {self.client_name}'
