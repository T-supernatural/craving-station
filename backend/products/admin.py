from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'available', 'featured', 'created_at')
    list_filter = ('category', 'available', 'featured')
    search_fields = ('name', 'description')
