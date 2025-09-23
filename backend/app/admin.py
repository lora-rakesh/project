from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import EmployeeUser

class EmployeeUserAdmin(UserAdmin):
    model = EmployeeUser
    list_display = ("employee_id", "first_name", "last_name", "role", "is_staff", "is_superuser", "is_active")
    list_filter = ("role", "is_staff", "is_superuser", "is_active")
    search_fields = ("employee_id", "first_name", "last_name")
    ordering = ("employee_id",)
    filter_horizontal = ("groups", "user_permissions")

    fieldsets = (
        (None, {"fields": ("employee_id", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name")}),
        ("Permissions", {"fields": ("role", "is_staff", "is_active", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login",)}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("employee_id", "role", "first_name", "last_name", "password1", "password2", "is_staff", "is_active"),
        }),
    )

admin.site.register(EmployeeUser, EmployeeUserAdmin)
