#models.py
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class EmployeeUserManager(BaseUserManager):
    def create_user(self, employee_id, email=None, role="employee", password=None, **extra_fields):
        if not employee_id:
            raise ValueError("Employee ID is required")
        email = self.normalize_email(email) if email else None
        user = self.model(employee_id=employee_id, email=email, role=role, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, employee_id, email, role="superadmin", password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if password is None:
            raise ValueError("Superuser must have a password.")
        return self.create_user(employee_id=employee_id, email=email, role=role, password=password, **extra_fields)


class Employee(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ("employee", "Employee"),
        ("manager", "Manager"),
        ("hr", "HR"),
        ("admin", "Admin"),
        ("superadmin", "Super Admin"),
    ]

    # Core fields
    employee_id = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="employee")
    first_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50, blank=True, null=True)

    # Contact & identity
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    aadhar = models.CharField(max_length=12, unique=True, null=True, blank=True)
    uan = models.CharField(max_length=20, unique=True, null=True, blank=True)

    # Banking
    bank_account = models.CharField(max_length=20, null=True, blank=True)
    ifsc = models.CharField(max_length=11, null=True, blank=True)
    bank_name = models.CharField(max_length=100, null=True, blank=True)

    # Personal
    profile_photo = models.ImageField(upload_to="profile_photos/", null=True, blank=True)
    gender = models.CharField(
        max_length=10,
        choices=[("male", "Male"), ("female", "Female"), ("other", "Other")],
        null=True,
        blank=True,
    )
    nationality = models.CharField(max_length=50, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    dob = models.DateField(null=True, blank=True)

    # Work
    work_location = models.CharField(max_length=100, null=True, blank=True)
    reporting_manager = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.SET_NULL, related_name="team_members"
    )
    department = models.CharField(max_length=100, null=True, blank=True)

    # System flags
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=True)

    objects = EmployeeUserManager()

    USERNAME_FIELD = "employee_id"
    REQUIRED_FIELDS = ["email", "role"]

    def __str__(self):
        return f"{self.employee_id} - {self.email or 'No Email'}"


class Attendance(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="attendances")
    date = models.DateField(default=timezone.localdate)
    clock_in = models.DateTimeField(null=True, blank=True)
    lunch_in = models.DateTimeField(null=True, blank=True)
    lunch_out = models.DateTimeField(null=True, blank=True)
    break_in = models.DateTimeField(null=True, blank=True)
    break_out = models.DateTimeField(null=True, blank=True)
    clock_out = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("employee", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.employee.employee_id} - {self.date}"


class MusterRequest(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="muster_requests")
    request_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reply = models.TextField(null=True, blank=True)  # HR reply or note

    class Meta:
        ordering = ["-request_date", "-created_at"]

    def __str__(self):
        return f"MusterRequest {self.employee.employee_id} - {self.request_date} - {self.status}"
