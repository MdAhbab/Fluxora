from django.http import JsonResponse


def http_400_view(request, exception):
    return JsonResponse({'error': 'Bad request'}, status=400)


def http_403_view(request, exception):
    return JsonResponse({'error': 'You do not have permission to access this resource'}, status=403)


def http_404_view(request, exception):
    return JsonResponse({'error': 'The requested resource was not found'}, status=404)


def http_500_view(request):
    return JsonResponse({'error': 'An internal server error occurred'}, status=500)
