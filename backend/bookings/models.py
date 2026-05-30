from django.conf import settings
from django.db import models


class Booking(models.Model):
    SERVICE_CHOICES = [
        ('catering', 'Catering Service'),
        ('custom_cake', 'Custom Cake Order'),
        ('event', 'Event Booking'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='bookings')
    client_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    service_type = models.CharField(max_length=50, choices=SERVICE_CHOICES, default='catering')
    event_date = models.DateField()
    event_time = models.TimeField()
    guest_count = models.PositiveIntegerField(default=1)
    notes = models.TextField(blank=True, null=True)
    admin_notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=30, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-event_date', '-created_at']

    def __str__(self):
        return f'{self.service_type.title()} booking for {self.client_name}'


class CateringRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='catering_requests')
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    event_date = models.DateField()
    guest_count = models.PositiveIntegerField(default=1)
    location = models.CharField(max_length=255, blank=True, null=True)
    package = models.CharField(max_length=120, blank=True, null=True)
    budget = models.PositiveIntegerField(blank=True, null=True)
    menu_preferences = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-event_date', '-created_at']

    def __str__(self):
        return f'Catering request for {self.name} on {self.event_date}'


class EventBooking(models.Model):
    EVENT_TYPE_CHOICES = [
        ('private_party', 'Private Party'),
        ('corporate_event', 'Corporate Event'),
        ('wedding', 'Wedding'),
        ('birthday', 'Birthday'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='event_bookings')
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    event_type = models.CharField(max_length=50, choices=EVENT_TYPE_CHOICES, default='private_party')
    venue = models.CharField(max_length=255, blank=True, null=True)
    event_date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    guest_count = models.PositiveIntegerField(default=1)
    catering_required = models.BooleanField(default=True)
    special_requests = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-event_date', '-created_at']

    def __str__(self):
        return f'{self.get_event_type_display()} booking for {self.name} on {self.event_date}'
