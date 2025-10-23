# fluxora/tasks.py
from datetime import date, timedelta
from django.db.models import Q

# Celery shared_task decorator (fallback if Celery not installed)
try:
    from celery import shared_task  # type: ignore
except Exception:
    def shared_task(*dargs, **dkwargs):  # type: ignore
        def _decorator(func):
            return func
        return _decorator

from .models import Invoice
from fluxora.services.notifications import notify_email


@shared_task(name='fluxora.tasks.send_invoice_reminders')
def send_invoice_reminders(days_before_due: int = 1):
    """
    Send reminders for pending invoices that are due within N days or overdue.
    """
    today = date.today()
    soon = today + timedelta(days=days_before_due)
    qs = Invoice.objects.filter(status='pending').filter(Q(due_date__lte=soon))
    count = 0
    for inv in qs.select_related('resident__user'):
        recipient = getattr(getattr(inv.resident, 'user', None), 'email', None)
        if not recipient:
            continue
        subj = f"Reminder: Invoice {inv.invoice_number} due {inv.due_date}"
        body = f"Dear resident, your invoice {inv.invoice_number} of amount {inv.amount} is due on {inv.due_date}."
        try:
            notify_email(recipient, subj, body)
            count += 1
        except Exception:
            # Swallow errors in batch; logging is handled by email backend/handlers
            continue
    return {'reminders_sent': count}
