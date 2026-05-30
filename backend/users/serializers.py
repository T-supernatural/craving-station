from django.contrib.auth import get_user_model, password_validation, authenticate
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(source='date_joined', read_only=True)
    order_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'phone',
            'role',
            'is_staff',
            'is_superuser',
            'profile_image',
            'delivery_address',
            'city',
            'landmark',
            'created_at',
            'order_count',
        )
        read_only_fields = ('id', 'username', 'role', 'is_staff', 'is_superuser')

    def get_full_name(self, obj):
        if obj.get_full_name():
            return obj.get_full_name()
        return obj.first_name or ''


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message='A user with that email already exists.',
            ),
        ],
    )
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    delivery_address = serializers.CharField(write_only=True, required=False, allow_blank=True)
    city = serializers.CharField(write_only=True, required=False, allow_blank=True)
    landmark = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'phone', 'full_name', 'delivery_address', 'city', 'landmark')
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate_password(self, value):
        password_validation.validate_password(value, self.instance)
        return value

    def create(self, validated_data):
        full_name = validated_data.pop('full_name', '').strip()
        email = validated_data.get('email')
        user = User(
            username=email,
            email=email,
            phone=validated_data.get('phone', ''),
            delivery_address=validated_data.get('delivery_address', ''),
            city=validated_data.get('city', ''),
            landmark=validated_data.get('landmark', ''),
        )

        if full_name:
            parts = full_name.split(' ', 1)
            user.first_name = parts[0]
            user.last_name = parts[1] if len(parts) > 1 else ''

        user.set_password(validated_data['password'])
        user.save()
        return user


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField(write_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.pop('username', None)
        self.fields['email'] = serializers.EmailField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        user = authenticate(request=self.context.get('request'), username=email, password=password)
        if user is None or not user.is_active:
            raise serializers.ValidationError('Unable to log in with provided credentials.', code='authorization')

        data = super().validate({'username': email, 'password': password})
        data['user'] = UserSerializer(user).data
        return data
