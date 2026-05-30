from django.contrib import admin
from .models import RestaurantSettings, Testimonial


@admin.register(RestaurantSettings)
class RestaurantSettingsAdmin(admin.ModelAdmin):
    list_display = ('restaurant_name', 'restaurant_phone', 'restaurant_email', 'accept_orders', 'accept_reservations')
    list_filter = ('accept_orders', 'accept_reservations')
    search_fields = ('restaurant_name', 'restaurant_email', 'restaurant_phone')


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('author_name', 'rating', 'approved', 'is_featured', 'created_at')
    list_filter = ('approved', 'is_featured', 'rating')
    search_fields = ('author_name', 'content')
