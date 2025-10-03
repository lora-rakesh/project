# core/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Employee, Attendance, MusterRequest
from django.utils.translation import gettext_lazy as _

@admin.register(Employee)
class EmployeeAdmin(BaseUserAdmin):
    fieldsets = (
        (None, {"fields": ("employee_id", "password")}),
        (_("Personal info"), {"fields": ("first_name", "last_name", "email", "phone", "profile_photo")}),
        (_("Work"), {"fields": ("role", "department", "work_location", "reporting_manager")}),
        (_("Identity"), {"fields": ("aadhar", "uan")}),
        (_("Banking"), {"fields": ("bank_account", "ifsc", "bank_name")}),
        (_("Permissions"), {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("employee_id", "email", "role", "password1", "password2"),
        }),
    )
    list_display = ("employee_id", "email", "first_name", "last_name", "role", "is_staff")
    search_fields = ("employee_id", "email", "first_name", "last_name")
    ordering = ("employee_id",)

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ("employee", "date", "clock_in", "clock_out")
    list_filter = ("date",)

@admin.register(MusterRequest)
class MusterRequestAdmin(admin.ModelAdmin):
    list_display = ("employee", "request_date", "status")
    list_filter = ("status", "request_date")
