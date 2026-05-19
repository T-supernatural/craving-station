from rest_framework import serializers
from .models import RestaurantSettings


class RestaurantSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestaurantSettings
        fields = [
            'id',
            'restaurant_name',
            'restaurant_description',
            'restaurant_address',
            'restaurant_phone',
            'restaurant_email',
            'delivery_fee',
            'accept_orders',
            'accept_reservations',
            'opening_hours',
            'updated_at',
        ]
        read_only_fields = ['id', 'updated_at']
