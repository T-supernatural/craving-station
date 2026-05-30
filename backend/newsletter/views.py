from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from .models import Subscriber
from .serializers import SubscriberSerializer


class SubscriberCreateAPIView(CreateAPIView):
    queryset = Subscriber.objects.all()
    serializer_class = SubscriberSerializer
    permission_classes = [AllowAny]
