from django.db import models

# Create your models here.

class InvoiceStatus(models.TextChoices):
    DRAFT = 'DRAFT'
    SENT = 'SENT'
    PAID = 'PAID'
    OVERDUE = 'OVERDUE'

class Invoice(models.Model):
    invoice_number = models.CharField(max_length=20, unique=True)
    client_name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=InvoiceStatus.choices)
    issue_date = models.DateField()
    due_date = models.DateField()
    file = models.FileField(upload_to='invoices/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)