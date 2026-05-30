from django.contrib import admin
from .models import Booking, CateringRequest, EventBooking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('client_name', 'service_type', 'event_date', 'guest_count', 'status')
    list_filter = ('service_type', 'status', 'event_date')
    search_fields = ('client_name', 'email', 'phone')


@admin.register(CateringRequest)
class CateringRequestAdmin(admin.ModelAdmin):
    list_display = ('name', 'event_date', 'guest_count', 'package', 'status')
    list_filter = ('status', 'event_date')
    search_fields = ('name', 'email', 'phone', 'location')


@admin.register(EventBooking)
class EventBookingAdmin(admin.ModelAdmin):
    list_display = ('name', 'event_type', 'event_date', 'guest_count', 'status')
    list_filter = ('event_type', 'status', 'event_date')
    search_fields = ('name', 'email', 'phone', 'venue')
