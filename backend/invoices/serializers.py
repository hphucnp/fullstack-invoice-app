from rest_framework import serializers
from decimal import Decimal
from datetime import date
from .models import Invoice, InvoiceStatus


class InvoiceSerializer(serializers.ModelSerializer):
    """
    Serializer for Invoice model with validation
    """
    
    class Meta:
        model = Invoice
        fields = [
            'id',
            'invoice_number', 
            'client_name',
            'amount',
            'status',
            'issue_date',
            'due_date',
            'file',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    def validate_invoice_number(self, value):
        """
        Validate invoice number format and uniqueness
        """
        if not value:
            raise serializers.ValidationError("Invoice number is required.")
        
        # Check if updating existing invoice
        if self.instance:
            # If updating and number hasn't changed, skip uniqueness check
            if self.instance.invoice_number == value:
                return value
        
        # Check uniqueness
        if Invoice.objects.filter(invoice_number=value).exists():
            raise serializers.ValidationError("Invoice number already exists.")
        
        return value.upper()
    
    def validate_client_name(self, value):
        """
        Validate client name
        """
        if not value or not value.strip():
            raise serializers.ValidationError("Client name is required.")
        
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Client name must be at least 2 characters long.")
        
        return value.strip().title()
    
    def validate_amount(self, value):
        """
        Validate amount
        """
        if value is None:
            raise serializers.ValidationError("Amount is required.")
        
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        
        if value > Decimal('999999.99'):
            raise serializers.ValidationError("Amount cannot exceed 999,999.99.")
        
        return value
    
    def validate_status(self, value):
        """
        Validate status
        """
        if value not in [choice[0] for choice in InvoiceStatus.choices]:
            raise serializers.ValidationError(f"Invalid status. Must be one of: {[choice[0] for choice in InvoiceStatus.choices]}")
        
        return value
    
    def validate_due_date(self, value):
        """
        Validate due date
        """
        if not value:
            raise serializers.ValidationError("Due date is required.")
        
        return value
    
    def validate_issue_date(self, value):
        """
        Validate issue date
        """
        if not value:
            raise serializers.ValidationError("Issue date is required.")
        
        if value > date.today():
            raise serializers.ValidationError("Issue date cannot be in the future.")
        
        return value
    
    def validate(self, attrs):
        """
        Cross-field validation
        """
        issue_date = attrs.get('issue_date')
        due_date = attrs.get('due_date')
        
        # If updating, get current values if not provided
        if self.instance:
            issue_date = issue_date or self.instance.issue_date
            due_date = due_date or self.instance.due_date
        
        if issue_date and due_date:
            if due_date < issue_date:
                raise serializers.ValidationError("Due date cannot be earlier than issue date.")
        
        return attrs
    
    def validate_file(self, value):
        """
        Validate uploaded file
        """
        if value:
            # Check file size (limit to 10MB)
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("File size cannot exceed 10MB.")
            
            # Check file extension
            allowed_extensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx']
            if not any(value.name.lower().endswith(ext) for ext in allowed_extensions):
                raise serializers.ValidationError(
                    f"File type not supported. Allowed types: {', '.join(allowed_extensions)}"
                )
        
        return value


class InvoiceCreateSerializer(InvoiceSerializer):
    """
    Serializer specifically for creating invoices with required fields
    """
    
    class Meta(InvoiceSerializer.Meta):
        fields = InvoiceSerializer.Meta.fields
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make certain fields required for creation
        self.fields['invoice_number'].required = True
        self.fields['client_name'].required = True
        self.fields['amount'].required = True
        self.fields['status'].required = True
        self.fields['issue_date'].required = True
        self.fields['due_date'].required = True


class InvoiceUpdateSerializer(InvoiceSerializer):
    """
    Serializer specifically for updating invoices with partial updates allowed
    """
    
    class Meta(InvoiceSerializer.Meta):
        fields = InvoiceSerializer.Meta.fields
        read_only_fields = ['id', 'created_at', 'updated_at', 'invoice_number']
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make all fields optional for updates
        for field in self.fields:
            self.fields[field].required = False


class InvoiceListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing invoices
    """
    
    class Meta:
        model = Invoice
        fields = [
            'id',
            'invoice_number',
            'client_name', 
            'amount',
            'status',
            'issue_date',
            'due_date',
            'created_at'
        ]
        read_only_fields = fields


class InvoiceDetailSerializer(InvoiceSerializer):
    """
    Detailed serializer for single invoice view with additional computed fields
    """
    days_until_due = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    
    class Meta(InvoiceSerializer.Meta):
        fields = InvoiceSerializer.Meta.fields + ['days_until_due', 'is_overdue', 'file_url']
    
    def get_days_until_due(self, obj):
        """
        Calculate days until due date
        """
        if obj.due_date:
            delta = obj.due_date - date.today()
            return delta.days
        return None
    
    def get_is_overdue(self, obj):
        """
        Check if invoice is overdue
        """
        return obj.due_date < date.today() if obj.due_date else False
    
    def get_file_url(self, obj):
        """
        Get full URL for file
        """
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None