from django.urls import path
from . import views   

urlpatterns = [
    path("api/login/", views.LoginAPIView.as_view(), name="login"),
    path("api/register-employee/", views.register_employee, name="register-employee"),
    path("api/employees/", views.list_employees, name="list-employees"),
    path("api/employees/<str:employee_id>/update/", views.update_employee, name="update-employee"),
    path("api/employees/<str:employee_id>/delete/", views.delete_employee, name="delete-employee"),
    path("api/attendance-summary/", views.attendance_summary_api, name="attendance-summary-api"),
    path("api/update_profile/", views.update_profile, name="update_profile"),
    path("api/clock_in/", views.clock_in, name="clock_in"),
    path("api/clock_out/", views.clock_out, name="clock_out"),
    path("api/break_in/", views.break_in, name="break_in"),
    path("api/break_out/", views.break_out, name="break_out"),
    path("api/lunch_in/", views.lunch_in, name="lunch_in"),
    path("api/lunch_out/", views.lunch_out, name="lunch_out"),

    path("api/muster-request/", views.create_muster_request, name="create-muster-request"),
    path("api/muster-request/list/", views.list_muster_requests, name="list-muster-request"),
    path("api/muster-request/<int:request_id>/edit/", views.edit_muster_request, name="edit-muster-request"),
]
