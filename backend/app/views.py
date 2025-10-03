from django.contrib.auth import login
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Employee, Attendance, MusterRequest
from .serializers import (
    EmployeeCreateSerializer,
    EmployeeSerializer,
    EmployeeSelfUpdateSerializer,
    AttendanceSerializer,
    MusterRequestSerializer,
    MusterRequestUpdateSerializer,
)
from .permissions import IsHRAdminManager, IsSelfOrHRAdminManager, IsOwnerOrHRAdminManager


# ======================== Custom JWT Login View ========================
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data.update({
            "user_id": self.user.id,
            "employee_id": getattr(self.user, "employee_id", None),
            "role": getattr(self.user, "role", None)
        })
        return data


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            login(request, self.user)  # ✅ Session login for API dashboard
        return response


# ======================== Employee API ========================
class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    lookup_field = "employee_id"

    def get_serializer_class(self):
        if self.action == "create":
            return EmployeeCreateSerializer
        if self.action in ("partial_update", "update") and self.request.user.employee_id == self.kwargs.get("employee_id"):
            return EmployeeSelfUpdateSerializer
        return EmployeeSerializer

    def get_permissions(self):
        if self.action in ("create", "list", "destroy"):
            permission_classes = [IsAuthenticated, IsHRAdminManager]
        elif self.action in ("update", "partial_update"):
            permission_classes = [IsAuthenticated, IsSelfOrHRAdminManager]
        elif self.action in ("retrieve",):
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]
        return [p() for p in permission_classes]


# ======================== Attendance API ========================
class AttendanceViewSet(viewsets.GenericViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    lookup_field = "id"
    permission_classes = [IsAuthenticated]

    def list(self, request):
        employee_id = request.query_params.get("employee_id")
        qs = self.queryset
        if employee_id:
            qs = qs.filter(employee__employee_id=employee_id)
        else:
            qs = qs.filter(employee=request.user)

        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    def get_or_create_today(self, employee):
        today = timezone.localdate()
        obj, created = Attendance.objects.get_or_create(employee=employee, date=today)
        return obj

    def _get_target_employee(self, request):
        employee_id = request.data.get("employee_id")
        if employee_id and request.user.role in ("hr", "admin", "manager", "superadmin"):
            return get_object_or_404(Employee, employee_id=employee_id)
        return request.user

    @action(detail=False, methods=["post"])
    def clock_in(self, request):
        target_emp = self._get_target_employee(request)
        att = self.get_or_create_today(target_emp)
        if att.clock_in:
            return Response({"detail": "Already clocked in."}, status=status.HTTP_400_BAD_REQUEST)
        att.clock_in = timezone.now()
        att.save()
        return Response(self.get_serializer(att).data)

    @action(detail=False, methods=["post"])
    def lunch_in(self, request):
        target_emp = self._get_target_employee(request)
        att = self.get_or_create_today(target_emp)
        if att.lunch_in:
            return Response({"detail": "Already lunch-in recorded."}, status=status.HTTP_400_BAD_REQUEST)
        att.lunch_in = timezone.now()
        att.save()
        return Response(self.get_serializer(att).data)

    @action(detail=False, methods=["post"])
    def lunch_out(self, request):
        target_emp = self._get_target_employee(request)
        att = self.get_or_create_today(target_emp)
        if att.lunch_out:
            return Response({"detail": "Already lunch-out recorded."}, status=status.HTTP_400_BAD_REQUEST)
        att.lunch_out = timezone.now()
        att.save()
        return Response(self.get_serializer(att).data)

    @action(detail=False, methods=["post"])
    def break_in(self, request):
        target_emp = self._get_target_employee(request)
        att = self.get_or_create_today(target_emp)
        if att.break_in:
            return Response({"detail": "Already break-in recorded."}, status=status.HTTP_400_BAD_REQUEST)
        att.break_in = timezone.now()
        att.save()
        return Response(self.get_serializer(att).data)

    @action(detail=False, methods=["post"])
    def break_out(self, request):
        target_emp = self._get_target_employee(request)
        att = self.get_or_create_today(target_emp)
        if att.break_out:
            return Response({"detail": "Already break-out recorded."}, status=status.HTTP_400_BAD_REQUEST)
        att.break_out = timezone.now()
        att.save()
        return Response(self.get_serializer(att).data)

    @action(detail=False, methods=["post"])
    def clock_out(self, request):
        target_emp = self._get_target_employee(request)
        att = self.get_or_create_today(target_emp)
        if att.clock_out:
            return Response({"detail": "Already clocked out."}, status=status.HTTP_400_BAD_REQUEST)
        att.clock_out = timezone.now()
        att.save()
        return Response(self.get_serializer(att).data)


# ======================== Muster Requests API ========================
class MusterRequestViewSet(viewsets.ModelViewSet):
    queryset = MusterRequest.objects.all()
    serializer_class = MusterRequestSerializer
    lookup_field = "id"

    def get_permissions(self):
        if self.action in ("create", "list", "retrieve"):
            permission_classes = [IsAuthenticated]
        elif self.action in ("update", "partial_update", "destroy"):
            permission_classes = [IsAuthenticated, IsOwnerOrHRAdminManager]
        else:
            permission_classes = [IsAuthenticated]
        return [p() for p in permission_classes]

    def perform_create(self, serializer):
        serializer.save(employee=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.role in ("hr", "admin", "manager", "superadmin"):
            return self.queryset
        return self.queryset.filter(employee=user)

    def get_serializer_class(self):
        if self.action in ("partial_update", "update"):
            if self.request.user.role in ("hr", "admin", "manager", "superadmin"):
                return MusterRequestUpdateSerializer
        return super().get_serializer_class()
