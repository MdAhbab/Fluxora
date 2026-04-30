import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Create or update a Django superuser from environment variables."

    def handle(self, *args, **options):
        User = get_user_model()
        username = os.getenv('ADMIN_USERNAME', 'admin')
        email = os.getenv('ADMIN_EMAIL', 'admin@example.com')
        password = os.getenv('ADMIN_PASSWORD', 'admin1234')

        user, created = User.objects.get_or_create(username=username, defaults={
            'email': email,
            'is_staff': True,
            'is_superuser': True,
        })

        if created:
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Created superuser '{username}' ({email})"))
        else:
            # Ensure flags and reset password if ADMIN_RESET_PASSWORD=true
            changed = False
            if not user.is_staff:
                user.is_staff = True
                changed = True
            if not user.is_superuser:
                user.is_superuser = True
                changed = True
            if os.getenv('ADMIN_RESET_PASSWORD', 'false').lower() == 'true':
                user.set_password(password)
                changed = True
            if changed:
                user.save()
                self.stdout.write(self.style.WARNING(f"Updated superuser '{username}'"))
            else:
                self.stdout.write(self.style.NOTICE(f"Superuser '{username}' already exists and is up to date"))

        self.stdout.write(self.style.SUCCESS('Done.'))

