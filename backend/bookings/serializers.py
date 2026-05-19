from rest_framework import serializers
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    name = serializers.CharField(source='client_name')
    date = serializers.DateField(source='event_date')
    time = serializers.TimeField(source='event_time')
    guests = serializers.IntegerField(source='guest_count')
    special_requests = serializers.CharField(source='notes', allow_blank=True, allow_null=True, required=False)

    class Meta:
        model = Booking
        fields = [
            'id',
            'user_id',
            'name',
            'email',
            'phone',
            'service_type',
            'date',
            'time',
            'guests',
            'special_requests',
            'status',
            'admin_notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user_id', 'created_at', 'updated_at']


class BookingCreateSerializer(BookingSerializer):
    class Meta(BookingSerializer.Meta):
        read_only_fields = ['id', 'user_id', 'created_at', 'updated_at']
