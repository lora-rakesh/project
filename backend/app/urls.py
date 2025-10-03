from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, AttendanceViewSet, MusterRequestViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r"employees", EmployeeViewSet, basename="employee")
router.register(r"attendance", AttendanceViewSet, basename="attendance")
router.register(r"muster-requests", MusterRequestViewSet, basename="musterrequest")

urlpatterns = [
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("", include(router.urls)),
]