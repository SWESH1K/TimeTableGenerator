from django.urls import path
from . import views

urlpatterns = [
    path('generate_timetable/', views.generate_timetable),
]
