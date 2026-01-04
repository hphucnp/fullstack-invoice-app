import { useState, useEffect } from 'react';
import InvoiceList from './components/InvoiceList';
import InvoiceForm from './components/InvoiceForm';
import FilterPanel from './components/FilterPanel';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice } from './services/api';

function App() {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [filters, setFilters] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [invoices, filters]);

  const fetchInvoices = async (filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getInvoices(filterParams);
      setInvoices(response.data);
    } catch (err) {
      setError('Failed to fetch invoices. Make sure the backend server is running.');
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...invoices];

    if (filters.status) {
      filtered = filtered.filter(inv => inv.status === filters.status);
    }

    if (filters.client_name) {
      filtered = filtered.filter(inv =>
        inv.client_name.toLowerCase().includes(filters.client_name.toLowerCase())
      );
    }

    if (filters.invoice_number) {
      filtered = filtered.filter(inv =>
        inv.invoice_number.toLowerCase().includes(filters.invoice_number.toLowerCase())
      );
    }

    if (filters.issue_date_from) {
      filtered = filtered.filter(inv => inv.issue_date >= filters.issue_date_from);
    }

    if (filters.issue_date_to) {
      filtered = filtered.filter(inv => inv.issue_date <= filters.issue_date_to);
    }

    setFilteredInvoices(filtered);
  };

  const handleCreateInvoice = async (invoiceData) => {
    try {
      setError(null);
      await createInvoice(invoiceData);
      await fetchInvoices();
      setShowForm(false);
    } catch (err) {
      setError('Failed to create invoice. Please check your input.');
      console.error('Error creating invoice:', err);
      alert('Failed to create invoice. Please check your input and try again.');
    }
  };

  const handleUpdateInvoice = async (invoiceData) => {
    try {
      setError(null);
      await updateInvoice(editingInvoice.id, invoiceData);
      await fetchInvoices();
      setShowForm(false);
      setEditingInvoice(null);
    } catch (err) {
      setError('Failed to update invoice. Please check your input.');
      console.error('Error updating invoice:', err);
      alert('Failed to update invoice. Please check your input and try again.');
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        setError(null);
        await deleteInvoice(id);
        await fetchInvoices();
      } catch (err) {
        setError('Failed to delete invoice.');
        console.error('Error deleting invoice:', err);
        alert('Failed to delete invoice. Please try again.');
      }
    }
  };

  const handleEditClick = (invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingInvoice(null);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
              <p className="mt-2 text-gray-600">
                Manage and track all your invoices in one place
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
            >
              + New Invoice
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <FilterPanel
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </div>

        <InvoiceList
          invoices={filteredInvoices}
          onEdit={handleEditClick}
          onDelete={handleDeleteInvoice}
          loading={loading}
        />

        {showForm && (
          <InvoiceForm
            invoice={editingInvoice}
            onSubmit={editingInvoice ? handleUpdateInvoice : handleCreateInvoice}
            onCancel={handleFormCancel}
          />
        )}
      </div>
    </div>
  );
}

export default App;
