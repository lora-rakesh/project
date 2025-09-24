from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import EmployeeUser, Attendance, MusterRequest


@admin.register(EmployeeUser)
class EmployeeUserAdmin(UserAdmin):
    model = EmployeeUser

    list_display = (
        "employee_id",
        "first_name",
        "last_name",
        "email",
        "phone",
        "role",
        "department",
        "work_location",
        "is_staff",
        "is_superuser",
        "is_active",
    )

    list_filter = ("role", "department", "work_location", "is_staff", "is_superuser", "is_active")
    search_fields = ("employee_id", "first_name", "last_name", "email", "phone")
    ordering = ("employee_id",)
    filter_horizontal = ("groups", "user_permissions")

    fieldsets = (
        (None, {"fields": ("employee_id", "password")}),
        ("Personal Info", {
            "fields": (
                "first_name",
                "last_name",
                "email",
                "phone",
                "aadhar",
                "uan",
                "dob",
                "gender",
                "nationality",
                "address",
                "profile_photo",
            )
        }),
        ("Work Info", {
            "fields": (
                "role",
                "department",
                "work_location",
                "reporting_manager",
            )
        }),
        ("Bank Info", {
            "fields": (
                "bank_account",
                "ifsc",
                "bank_name",
            )
        }),
        ("Permissions", {
            "fields": (
                "is_staff",
                "is_active",
                "is_superuser",
                "groups",
                "user_permissions",
            )
        }),
        ("Important Dates", {"fields": ("last_login",)}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "employee_id",
                "role",
                "first_name",
                "last_name",
                "email",
                "phone",
                "password1",
                "password2",
                "is_staff",
                "is_active",
            ),
        }),
    )


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ("user", "date", "clock_in", "clock_out", "break_in", "break_out", "lunch_in", "lunch_out")
    list_filter = ("date", "user__role", "user__department")
    search_fields = ("user__employee_id", "user__first_name", "user__last_name")


@admin.register(MusterRequest)
class MusterRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "employee", "action", "requested_time", "status", "created_at", "updated_at")
    list_filter = ("action", "status", "created_at")
    search_fields = ("employee__employee_id", "employee__first_name", "employee__last_name", "reason")
    readonly_fields = ("created_at", "updated_at")
