# core/serializers.py
from rest_framework import serializers
from .models import Employee, Attendance, MusterRequest
from django.contrib.auth import get_user_model

User = get_user_model()


class EmployeeCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)

    class Meta:
        model = User
        fields = [
            "id",
            "employee_id",
            "email",
            "password",
            "role",
            "first_name",
            "last_name",
            "phone",
            "department",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        pwd = validated_data.pop("password")
        user = User.objects.create_user(password=pwd, **validated_data)
        return user


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ["password"]
        read_only_fields = ["id", "employee_id"]


class EmployeeSelfUpdateSerializer(serializers.ModelSerializer):
    # Fields employee can change themselves
    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "phone",
            "profile_photo",
            "address",
            "dob",
            "nationality",
        ]


class AttendanceSerializer(serializers.ModelSerializer):
    employee = serializers.SlugRelatedField(slug_field="employee_id", queryset=User.objects.all())

    class Meta:
        model = Attendance
        fields = "__all__"
        read_only_fields = ["created_at"]


class MusterRequestSerializer(serializers.ModelSerializer):
    employee = serializers.SlugRelatedField(slug_field="employee_id", queryset=User.objects.all(), required=False)

    class Meta:
        model = MusterRequest
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at", "status"]

    def create(self, validated_data):
        # employee is set from request.user in the view — keep fallback
        if "employee" not in validated_data:
            request = self.context.get("request")
            if request and hasattr(request, "user"):
                validated_data["employee"] = request.user
        return super().create(validated_data)


class MusterRequestUpdateSerializer(serializers.ModelSerializer):
    # For HR/Admin/Manager to update status and reply
    class Meta:
        model = MusterRequest
        fields = ["status", "reply"]
