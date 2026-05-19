from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Notification

User = get_user_model()


class NotificationSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(source='user', queryset=User.objects.all(), write_only=True)
    recipient_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'recipient_id', 'user_id', 'title', 'message', 'type', 'is_read', 'created_at', 'updated_at']
        read_only_fields = ['id', 'recipient_id', 'created_at', 'updated_at']
