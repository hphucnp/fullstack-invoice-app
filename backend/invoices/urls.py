from rest_framework import routers

from invoices.views.invoice_views import InvoiceViewSet

invoice_router = routers.DefaultRouter()

invoice_router.register(r"invoices", InvoiceViewSet, basename="invoice")

urlpatterns = invoice_router.urls
