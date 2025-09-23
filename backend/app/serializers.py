from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import EmployeeUser, Attendance

# ---------------- Login ----------------
class LoginSerializer(serializers.Serializer):
    employee_id = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        employee_id = data.get("employee_id")
        password = data.get("password")

        user = authenticate(employee_id=employee_id, password=password)
        if not user:
            raise serializers.ValidationError("Invalid employee ID or password")
        if not user.is_active:
            raise serializers.ValidationError("User is inactive")

        data["user"] = user
        return data


# ---------------- Register Employee/HR/Manager ----------------
class RegisterEmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeUser
        fields = ["employee_id", "password", "first_name", "last_name", "role"]
        extra_kwargs = {
            "password": {"write_only": True},
            "role": {"default": "employee"}
        }

    def validate_role(self, value):
        role = value.lower()
        if role not in ["employee", "hr", "manager"]:
            raise serializers.ValidationError("Invalid role")
        return role

    def create(self, validated_data):
        password = validated_data.pop("password")
        role = validated_data.pop("role", "employee")
        user = EmployeeUser.objects.create_user(
            role=role,
            password=password,
            **validated_data
        )
        return user


# ---------------- Update Employee ----------------
class UpdateEmployeeSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    role = serializers.CharField(required=False)

    class Meta:
        model = EmployeeUser
        fields = ["first_name", "last_name", "password", "role"]

    def validate_role(self, value):
        role = value.lower()
        if role not in ["employee", "hr", "manager", "admin"]:
            raise serializers.ValidationError("Invalid role")
        return role

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        if password:
            instance.set_password(password)

        role = validated_data.pop("role", None)
        if role:
            instance.role = role.lower()
            if role.lower() in ["admin", "hr", "manager"]:
                instance.is_staff = True

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeUser
        fields = ["first_name", "last_name", "password"]
        extra_kwargs = {"password": {"write_only": True, "required": False}}

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        if password:
            instance.set_password(password)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = "__all__"

class AttendanceEmployeeSerializer(serializers.ModelSerializer):
    employee_id = serializers.CharField(source='user.employee_id')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')

    class Meta:
        model = Attendance
        fields = ['employee_id', 'first_name', 'last_name', 'clock_in', 'clock_out', 'break_in', 'break_out', 'lunch_in', 'lunch_out']

from rest_framework import serializers
from .models import MusterRequest

class MusterRequestSerializer(serializers.ModelSerializer):
    employee_id = serializers.CharField(source="employee.employee_id", read_only=True)

    class Meta:
        model = MusterRequest
        fields = [
            "id", "employee_id", "action", "requested_time", "reason", 
            "status", "created_at", "updated_at"
        ]
        read_only_fields = ["status", "created_at", "updated_at"]
