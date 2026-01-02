from rest_framework import viewsets
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters
from invoices.models import Invoice, InvoiceStatus
from invoices.serializers import InvoiceSerializer


class InvoiceFilter(filters.FilterSet):
    """Custom filter for Invoice model with status and date range filtering"""
    
    status = filters.ChoiceFilter(
        field_name='status',
        choices=InvoiceStatus.choices
    )
    
    # Date range filters
    issue_date_from = filters.DateFilter(field_name='issue_date', lookup_expr='gte')
    issue_date_to = filters.DateFilter(field_name='issue_date', lookup_expr='lte')
    due_date_from = filters.DateFilter(field_name='due_date', lookup_expr='gte')
    due_date_to = filters.DateFilter(field_name='due_date', lookup_expr='lte')
    created_at_from = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_at_to = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        model = Invoice
        fields = ['status', 'client_name']


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by('-created_at')
    serializer_class = InvoiceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = InvoiceFilter
    
    def get_queryset(self):
        """
        Override to provide custom queryset with optimizations
        """
        queryset = super().get_queryset()
        
        # Manual filtering for more complex date range queries if needed
        status_param = self.request.query_params.get('status', None)
        issue_date_range = self.request.query_params.get('issue_date_range', None)
        client_name_param = self.request.query_params.get('client_name', None)
        invoice_number_param = self.request.query_params.get('invoice_number', None)
        
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        # Example for custom date range format (e.g., "2024-01-01,2024-12-31")
        if issue_date_range:
            try:
                start_date, end_date = issue_date_range.split(',')
                queryset = queryset.filter(
                    issue_date__range=[start_date.strip(), end_date.strip()]
                )
            except ValueError:
                pass  # Invalid format, ignore
        
        if client_name_param:
            queryset = queryset.filter(client_name__icontains=client_name_param)
        
        if invoice_number_param:
            queryset = queryset.filter(invoice_number__icontains=invoice_number_param)
                
        return queryset