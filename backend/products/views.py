from django.db.models import Q
from django.core.files.storage import default_storage
from rest_framework.generics import (
    ListAPIView,
    RetrieveAPIView,
    CreateAPIView,
    UpdateAPIView,
    DestroyAPIView,
)
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Product
from .serializers import ProductSerializer
import os
import time
import uuid


class ProductPagination(PageNumberPagination):
    page_size = 24
    page_size_query_param = 'page_size'
    max_page_size = 100


class ProductListAPIView(ListAPIView):
    queryset = Product.objects.all().order_by('-featured', 'name')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    pagination_class = ProductPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        featured = self.request.query_params.get('featured')
        available = self.request.query_params.get('available')
        search = self.request.query_params.get('search')

        if category:
            queryset = queryset.filter(category__iexact=category)

        if featured is not None:
            if featured.lower() in ['true', '1', 'yes', 'on']:
                queryset = queryset.filter(featured=True)
            elif featured.lower() in ['false', '0', 'no', 'off']:
                queryset = queryset.filter(featured=False)

        if available is not None:
            if available.lower() in ['true', '1', 'yes', 'on']:
                queryset = queryset.filter(available=True)
            elif available.lower() in ['false', '0', 'no', 'off']:
                queryset = queryset.filter(available=False)

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )

        return queryset


class ProductDetailAPIView(RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


class ProductCreateAPIView(CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        return [IsAuthenticated()]


class ProductUpdateAPIView(UpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['patch', 'put']

    def get_permissions(self):
        return [IsAuthenticated()]


class ProductDestroyAPIView(DestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        return [IsAuthenticated()]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"detail": "Product deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )


class ProductImageUploadAPIView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        image = request.FILES.get('file')
        if not image:
            return Response({'detail': 'No image file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            extension = os.path.splitext(image.name)[1] or '.jpg'
            file_name = f'products/{int(time.time())}-{uuid.uuid4().hex}{extension}'
            saved_path = default_storage.save(file_name, image)
            image_url = default_storage.url(saved_path)
            return Response({'image_url': image_url}, status=status.HTTP_201_CREATED)
        except Exception as exc:
            return Response(
                {'detail': 'Image upload failed: ' + str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

