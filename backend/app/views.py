from django.contrib.auth import login
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import EmployeeUser, Attendance
from .serializers import LoginSerializer, RegisterEmployeeSerializer
from django.shortcuts import render
from django.utils import timezone
from .serializers import ProfileUpdateSerializer

# ---------------- LOGIN ----------------
class LoginAPIView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            login(request, user)
            return Response({
                "message": "Login successful",
                "employee_id": user.employee_id,
                "role": user.role,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_admin": user.is_staff or user.is_superuser,
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ---------------- Register ----------------
@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def register_employee(request):
    if request.user.role not in ["admin", "hr", "manager"]:
        return Response({"error": "Only admin/hr/manager can add users"}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        return Response({
            "message": "Send POST request to register a new employee, HR, or Manager",
            "roles": ["employee", "hr", "manager"]
        }, status=status.HTTP_200_OK)

    serializer = RegisterEmployeeSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({"message": f"{user.role.capitalize()} registered successfully"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ---------------- List ----------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_employees(request):
    if request.user.role not in ["admin", "hr", "manager"]:
        return Response({"error": "Only admin/hr/manager can view users"}, status=status.HTTP_403_FORBIDDEN)

    employees = EmployeeUser.objects.filter(role__in=["employee", "hr", "manager"]).values(
        "id", "employee_id", "first_name", "last_name", "role", "is_staff"
    )
    return Response(list(employees), status=status.HTTP_200_OK)

# ---------------- Update ----------------
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_employee(request, employee_id):
    if request.user.role not in ["admin", "hr", "manager"]:
        return Response({"error": "Only admin/hr/manager can edit users"}, status=status.HTTP_403_FORBIDDEN)

    try:
        employee = EmployeeUser.objects.get(employee_id=employee_id, role__in=["employee", "hr", "manager"])
    except EmployeeUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    employee.first_name = request.data.get("first_name", employee.first_name)
    employee.last_name = request.data.get("last_name", employee.last_name)

    role = request.data.get("role", employee.role).lower()
    if role in ["employee", "hr", "manager"]:
        employee.role = role
        if role in ["hr", "manager"]:
            employee.is_staff = True

    if "password" in request.data and request.data["password"]:
        employee.set_password(request.data["password"])

    employee.save()
    return Response({"message": f"{employee.role.capitalize()} updated successfully"}, status=status.HTTP_200_OK)

# ---------------- Delete ----------------
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_employee(request, employee_id):
    if request.user.role not in ["admin", "hr", "manager"]:
        return Response({"error": "Only admin/hr/manager can delete users"}, status=status.HTTP_403_FORBIDDEN)

    try:
        employee = EmployeeUser.objects.get(employee_id=employee_id, role__in=["employee", "hr", "manager"])
    except EmployeeUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    role = employee.role
    employee.delete()
    return Response({"message": f"{role.capitalize()} deleted successfully"}, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    serializer = ProfileUpdateSerializer(instance=request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Profile updated successfully"})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ----------------- Clock / Break / Lunch -----------------
def get_or_create_today_attendance(user):
    attendance, created = Attendance.objects.get_or_create(user=user, date=timezone.localdate())
    return attendance

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clock_in(request):
    attendance = get_or_create_today_attendance(request.user)
    attendance.clock_in = timezone.now()
    attendance.save()
    return Response({"message": "Clocked in successfully"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clock_out(request):
    attendance = get_or_create_today_attendance(request.user)
    attendance.clock_out = timezone.now()
    attendance.save()
    return Response({"message": "Clocked out successfully"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def break_in(request):
    attendance = get_or_create_today_attendance(request.user)
    attendance.break_in = timezone.now()
    attendance.save()
    return Response({"message": "Break started"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def break_out(request):
    attendance = get_or_create_today_attendance(request.user)
    attendance.break_out = timezone.now()
    attendance.save()
    return Response({"message": "Break ended"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def lunch_in(request):
    attendance = get_or_create_today_attendance(request.user)
    attendance.lunch_in = timezone.now()
    attendance.save()
    return Response({"message": "Lunch started"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def lunch_out(request):
    attendance = get_or_create_today_attendance(request.user)
    attendance.lunch_out = timezone.now()
    attendance.save()
    return Response({"message": "Lunch ended"})

# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import date
from .models import Attendance
from .serializers import AttendanceEmployeeSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_summary_api(request):
    # Only allow HR / Manager / Admin
    if request.user.role not in ["admin", "hr", "manager"]:
        return Response({"error": "Only admin/hr/manager can view attendance"}, status=403)

    today = date.today()

    data = {
        'clockin': AttendanceEmployeeSerializer(
            Attendance.objects.filter(date=today, clock_in__isnull=False), many=True
        ).data,
        'clockout': AttendanceEmployeeSerializer(
            Attendance.objects.filter(date=today, clock_out__isnull=False), many=True
        ).data,
        'breakin': AttendanceEmployeeSerializer(
            Attendance.objects.filter(date=today, break_in__isnull=False), many=True
        ).data,
        'breakout': AttendanceEmployeeSerializer(
            Attendance.objects.filter(date=today, break_out__isnull=False), many=True
        ).data,
        'lunchin': AttendanceEmployeeSerializer(
            Attendance.objects.filter(date=today, lunch_in__isnull=False), many=True
        ).data,
        'lunchout': AttendanceEmployeeSerializer(
            Attendance.objects.filter(date=today, lunch_out__isnull=False), many=True
        ).data,
    }

    return Response(data)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import MusterRequest
from .serializers import MusterRequestSerializer

# Create Muster Request
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_muster_request(request):
    serializer = MusterRequestSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(employee=request.user)
        return Response({
            "message": "Muster request submitted successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# List Muster Requests for the logged-in employee
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_muster_requests(request):
    requests = MusterRequest.objects.filter(employee=request.user).order_by("-created_at")
    serializer = MusterRequestSerializer(requests, many=True)
    return Response(serializer.data)

# Edit / resubmit Muster Request (only if pending or rejected)
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
        serializer.save(status="pending")  # Reset status to pending on edit
        return Response({
            "message": "Muster request updated successfully",
            "data": serializer.data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
