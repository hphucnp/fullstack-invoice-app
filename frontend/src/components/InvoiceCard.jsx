const InvoiceCard = ({ invoice, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    const colors = {
      DRAFT: 'bg-gray-200 text-gray-800',
      SENT: 'bg-blue-200 text-blue-800',
      PAID: 'bg-green-200 text-green-800',
      OVERDUE: 'bg-red-200 text-red-800',
    };
    return colors[status] || 'bg-gray-200 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      DRAFT: 'Draft',
      SENT: 'Sent',
      PAID: 'Paid',
      OVERDUE: 'Overdue',
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleViewFile = () => {
    if (invoice.file) {
      window.open(invoice.file, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {invoice.invoice_number}
          </h3>
          <p className="text-gray-600">{invoice.client_name}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
          {getStatusLabel(invoice.status)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm">Amount:</span>
          <span className="font-semibold text-gray-900">{formatAmount(invoice.amount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm">Issue Date:</span>
          <span className="text-gray-900">{formatDate(invoice.issue_date)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm">Due Date:</span>
          <span className="text-gray-900">{formatDate(invoice.due_date)}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-200">
        {invoice.file && (
          <button
            onClick={handleViewFile}
            className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            View File
          </button>
        )}
        <button
          onClick={() => onEdit(invoice)}
          className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(invoice.id)}
          className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default InvoiceCard;
