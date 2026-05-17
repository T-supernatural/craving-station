from django.db import models

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('cakes', 'Cakes'),
        ('donuts', 'Donuts'),
        ('pastries', 'Pastries'),
        ('bread', 'Bread'),
        ('desserts', 'Desserts'),
        ('catering', 'Catering Packages'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    image_url = models.URLField(blank=True, null=True)
    available = models.BooleanField(default=True)
    featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-featured', 'name']

    def __str__(self):
        return self.name
