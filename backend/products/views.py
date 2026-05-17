from django.db.models import Q
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from .models import Product
from .serializers import ProductSerializer


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
