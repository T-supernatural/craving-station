from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('client_name', 'service_type', 'event_date', 'guest_count', 'status')
    list_filter = ('service_type', 'status', 'event_date')
    search_fields = ('client_name', 'email', 'phone')
