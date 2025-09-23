from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone

class EmployeeUserManager(BaseUserManager):
    def create_user(self, employee_id, role="employee", password=None, first_name="", last_name="", **extra_fields):
        if not employee_id:
            raise ValueError("Employee ID is required")
        if not role:
            raise ValueError("Role is required")

        role = role.lower()  # normalize role input

        if role not in ["employee", "hr", "manager", "admin"]:
            raise ValueError("Invalid role")

        user = self.model(
            employee_id=employee_id,
            role=role,
            first_name=first_name,
            last_name=last_name,
            **extra_fields
        )
        user.set_password(password)

        if role in ["admin", "hr", "manager"]:
            user.is_staff = True

        user.save(using=self._db)
        return user

    def create_superuser(self, employee_id, role="admin", password=None, first_name="", last_name="", **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        role = role.lower()
        if role not in ["admin", "hr", "manager"]:
            raise ValueError("Superuser must have role = admin/hr/manager")

        return self.create_user(
            employee_id=employee_id,
            role=role,
            password=password,
            first_name=first_name,
            last_name=last_name,
            **extra_fields
        )


class EmployeeUser(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ("employee", "Employee"),
        ("hr", "HR"),
        ("manager", "Manager"),
        ("admin", "Admin"),
    ]

    employee_id = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="employee")
    first_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=True)

    objects = EmployeeUserManager()

    USERNAME_FIELD = "employee_id"
    REQUIRED_FIELDS = ["role", "first_name", "last_name"]

    def clean(self):
        if self.role:
            self.role = self.role.lower()

    def save(self, *args, **kwargs):
        self.clean()
        if self.role in ["admin", "hr", "manager"]:
            self.is_staff = True
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employee_id} ({self.role})"

from .models import EmployeeUser

class Attendance(models.Model):
    user = models.ForeignKey(EmployeeUser, on_delete=models.CASCADE)
    date = models.DateField(default=timezone.localdate)
    clock_in = models.DateTimeField(null=True, blank=True)
    clock_out = models.DateTimeField(null=True, blank=True)
    break_in = models.DateTimeField(null=True, blank=True)
    break_out = models.DateTimeField(null=True, blank=True)
    lunch_in = models.DateTimeField(null=True, blank=True)
    lunch_out = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.employee_id} - {self.date}"


from django.db import models
from .models import EmployeeUser

class MusterRequest(models.Model):
    ACTION_CHOICES = [
        ("clockin", "Clock In"),
        ("clockout", "Clock Out"),
    ]
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    employee = models.ForeignKey(EmployeeUser, on_delete=models.CASCADE)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    requested_time = models.DateTimeField()
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.employee.employee_id} - {self.action} at {self.requested_time}"
