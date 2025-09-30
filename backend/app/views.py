from django.utils import timezone
from datetime import date
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .models import EmployeeUser, Attendance, MusterRequest
from .serializers import (
    LoginSerializer,
    RegisterEmployeeSerializer,
    UpdateEmployeeSerializer,
    ProfileUpdateSerializer,
    AttendanceEmployeeSerializer,
    MusterRequestSerializer,
)


# ------------------ Helper ------------------
def get_tokens_for_user(user):
    """Return refresh + access JWT tokens for a user"""
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


# ------------------ LOGIN ------------------
class LoginAPIView(APIView):
    authentication_classes = []  # open
    permission_classes = []      # open

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            tokens = get_tokens_for_user(user)
            return Response({
                "message": "Login successful",
                "employee_id": user.employee_id,
                "role": user.role,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_admin": user.is_staff or user.is_superuser,
                "tokens": tokens,
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ------------------ Register Employee ------------------
@api_view(['POST'])
def register_employee(request):
    serializer = RegisterEmployeeSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response({
            "message": f"{user.role.capitalize()} registered successfully",
            "employee_id": user.employee_id,
            "role": user.role,
            "tokens": tokens,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ------------------ Employee CRUD ------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_employees(request):
    if request.user.role not in ["admin", "hr", "manager"]:
        return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

    employees = EmployeeUser.objects.filter(role__in=["employee", "hr", "manager"]).values(
        "id", "employee_id", "first_name", "last_name", "role", "is_staff"
    )
    return Response(list(employees), status=status.HTTP_200_OK)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_employee(request, employee_id):
    if request.user.role not in ["admin", "hr", "manager"]:
        return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

    try:
        employee = EmployeeUser.objects.get(employee_id=employee_id)
    except EmployeeUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = UpdateEmployeeSerializer(employee, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": f"{employee.role.capitalize()} updated successfully"})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_employee(request, employee_id):
    if request.user.role not in ["admin", "hr", "manager"]:
        return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

    try:
        employee = EmployeeUser.objects.get(employee_id=employee_id)
    except EmployeeUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    employee.delete()
    return Response({"message": "Employee deleted successfully"})


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    serializer = ProfileUpdateSerializer(instance=request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Profile updated successfully"})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ------------------ Attendance APIs ------------------
def get_or_create_today_attendance(user):
    attendance, _ = Attendance.objects.get_or_create(user=user, date=timezone.localdate())
    return attendance


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clock_in(request):
    attendance = get_or_create_today_attendance(request.user)
    attendance.clock_in = timezone.now()
    attendance.save()
    return Response({"message": "Clocked in", "time": attendance.clock_in})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clock_out(request):
    attendance = get_or_create_today_attendance(request.user)
    attendance.clock_out = timezone.now()
    attendance.save()
    return Response({"message": "Clocked out", "time": attendance.clock_out})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def break_in(request):
    attendance = get_or_create_today_attendance(request.user)
    attendance.break_in = timezone.now()
    attendance.save()
    return Response({"message": "Break started", "time": attendance.break_in})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def break_out(request):
    attendance = get_or_create_today_attendance(request.user)
    attendance.break_out = timezone.now()
    attendance.save()
    return Response({"message": "Break ended", "time": attendance.break_out})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def lunch_in(request):
    attendance = get_or_create_today_attendance(request.user)
    attendance.lunch_in = timezone.now()
    attendance.save()
    return Response({"message": "Lunch started", "time": attendance.lunch_in})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def lunch_out(request):
    attendance = get_or_create_today_attendance(request.user)
    attendance.lunch_out = timezone.now()
    attendance.save()
    return Response({"message": "Lunch ended", "time": attendance.lunch_out})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_summary_api(request):
    if request.user.role not in ["admin", "hr", "manager"]:
        return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

    today = date.today()
    data = {
        "clockin": AttendanceEmployeeSerializer(
            Attendance.objects.filter(date=today, clock_in__isnull=False), many=True
        ).data,
        "clockout": AttendanceEmployeeSerializer(
            Attendance.objects.filter(date=today, clock_out__isnull=False), many=True
        ).data,
        "breakin": AttendanceEmployeeSerializer(
            Attendance.objects.filter(date=today, break_in__isnull=False), many=True
        ).data,
        "breakout": AttendanceEmployeeSerializer(
            Attendance.objects.filter(date=today, break_out__isnull=False), many=True
        ).data,
        "lunchin": AttendanceEmployeeSerializer(
            Attendance.objects.filter(date=today, lunch_in__isnull=False), many=True
        ).data,
        "lunchout": AttendanceEmployeeSerializer(
            Attendance.objects.filter(date=today, lunch_out__isnull=False), many=True
        ).data,
    }
    return Response(data)


# ------------------ Muster Request APIs ------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_muster_request(request):
    serializer = MusterRequestSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(employee=request.user)
        return Response({"message": "Muster request submitted", "data": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_muster_requests(request):
    requests = MusterRequest.objects.filter(employee=request.user).order_by("-created_at")
    serializer = MusterRequestSerializer(requests, many=True)
    return Response(serializer.data)


@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def edit_muster_request(request, request_id):
    try:
        muster_request = MusterRequest.objects.get(id=request_id, employee=request.user)
    except MusterRequest.DoesNotExist:
        return Response({"error": "Request not found"}, status=status.HTTP_404_NOT_FOUND)

    if muster_request.status == "approved":
        return Response({"error": "Approved requests cannot be edited"}, status=status.HTTP_400_BAD_REQUEST)

    serializer = MusterRequestSerializer(muster_request, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save(status="pending")  # reset to pending
        return Response({"message": "Muster request updated", "data": serializer.data})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
