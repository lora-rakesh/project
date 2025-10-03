
from rest_framework import permissions


def is_hr_admin_manager(user):
    return user and user.is_authenticated and user.role in ("hr", "admin", "manager", "superadmin")


class IsHRAdminManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return is_hr_admin_manager(request.user)


class IsSelfOrHRAdminManager(permissions.BasePermission):
    """
    Allow object-level editing if the user is the object owner (self) OR HR/Admin/Manager.
    """

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if is_hr_admin_manager(request.user):
            return True
        # If obj is an Employee instance
        if hasattr(obj, "employee_id"):
            # user updating own profile
            return obj == request.user
        return False


class IsOwnerOrHRAdminManager(permissions.BasePermission):
    """
    For MusterRequest and Attendance objects — owner or HR/Admin/Manager can edit/delete.
    """

    def has_object_permission(self, request, view, obj):
        if is_hr_admin_manager(request.user):
            return True
        # owner: obj.employee == request.user
        if hasattr(obj, "employee"):
            return obj.employee == request.user
        return False
