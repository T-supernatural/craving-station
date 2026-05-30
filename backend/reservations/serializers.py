from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Reservation

User = get_user_model()


class ReservationSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='customer_name')
    email = serializers.EmailField(source='customer_email')
    phone = serializers.CharField(source='customer_phone')
    date = serializers.DateField(source='reservation_date')
    time = serializers.TimeField(source='reservation_time')
    guests = serializers.IntegerField(source='number_of_guests')
    special_requests = serializers.CharField(source='special_requests', allow_blank=True, required=False)
    user_id = serializers.PrimaryKeyRelatedField(source='user', read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'date',
            'time',
            'guests',
            'special_requests',
            'status',
            'user_id',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'status', 'user_id', 'created_at', 'updated_at']

    def create(self, validated_data):
        data = validated_data.copy()
        data['customer_name'] = data.pop('customer_name')
        data['customer_email'] = data.pop('customer_email')
        data['customer_phone'] = data.pop('customer_phone')
        data['reservation_date'] = data.pop('reservation_date')
        data['reservation_time'] = data.pop('reservation_time')
        data['number_of_guests'] = data.pop('number_of_guests')

        user = self.context['request'].user
        return Reservation.objects.create(user=user, **data)


class ReservationStatusSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(choices=Reservation.STATUS_CHOICES)
    admin_notes = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Reservation
        fields = ['status', 'admin_notes']
