from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication

def http_404_view(request, exception):
    return JsonResponse({'error': 'The requested resource was not found'}, status=404)
def http_403_view(request, exception):
    return JsonResponse({'error': 'You do not have permission to access this resource'}, status=403)
def http_500_view(request):
    return JsonResponse({'error': 'An internal server error occurred'}, status=500)
def http_400_view(request):
    return JsonResponse({'error': 'Bad request'}, status=400)
#
# # Password validation
# # https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators
