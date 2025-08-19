import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, Button } from '../../components/ui';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceFormData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerCode: string;
  clientName: string;
  clientCompany: string;
  clientAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  vat: number;
  total: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
}

const CreateInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
  const thirtyDaysLaterStr = thirtyDaysLater.toISOString().slice(0, 10);
  
  const generateInvoiceNumber = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `INV-${randomNum}`;
  };
  
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: today,
    dueDate: thirtyDaysLaterStr,
    customerCode: '',
    clientName: '',
    clientCompany: '',
    clientAddress: '',
    items: [{ description: 'Transport: ', quantity: 1, unitPrice: 0, total: 0 }],
    subtotal: 0,
    vat: 0,
    total: 0,
    bankName: 'Standard Bank',
    accountName: 'Matanuska (Pty) Ltd',
    accountNumber: '123456789',
    branchCode: '051001',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const items = [...formData.items];
    items[index] = {
      ...items[index],
      [name]: name === 'description' ? value : parseFloat(value) || 0,
    };
    
    // Recalculate total for this item
    if (name === 'quantity' || name === 'unitPrice') {
      items[index].total = items[index].quantity * items[index].unitPrice;
    }
    
    // Update all calculated fields
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const vat = subtotal * 0.15; // 15% VAT
    const total = subtotal + vat;
    
    setFormData({
      ...formData,
      items,
      subtotal,
      vat,
      total,
    });
  };
  
  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
  };
  
  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const items = formData.items.filter((_, i) => i !== index);
      
      // Recalculate totals
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const vat = subtotal * 0.15;
      const total = subtotal + vat;
      
      setFormData({
        ...formData,
        items,
        subtotal,
        vat,
        total,
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const db = getFirestore();
      const invoiceData = {
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'draft',
      };
      
      await addDoc(collection(db, 'invoices'), invoiceData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/invoices');
      }, 2000);
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError('Failed to create invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Create New Invoice</h1>
        <Button onClick={() => navigate('/invoices')}>Back to Invoices</Button>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
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
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">Invoice created successfully! Redirecting...</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-medium">Invoice Header</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700">Invoice No</label>
              <input
                type="text"
                id="invoiceNumber"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700">Invoice Date</label>
              <input
                type="date"
                id="invoiceDate"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="customerCode" className="block text-sm font-medium text-gray-700">Customer Code</label>
              <input
                type="text"
                id="customerCode"
                name="customerCode"
                value={formData.customerCode}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-medium">Client Information</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">Client Name</label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="clientCompany" className="block text-sm font-medium text-gray-700">Client Company</label>
              <input
                type="text"
                id="clientCompany"
                name="clientCompany"
                value={formData.clientCompany}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="clientAddress" className="block text-sm font-medium text-gray-700">Client Address</label>
              <textarea
                id="clientAddress"
                name="clientAddress"
                value={formData.clientAddress}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-gray-50">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Invoice Items</h2>
              <Button onClick={addItem} type="button">Add Item</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          name="description"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, e)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="e.g. Transport: Joburg to Durban"
                          required
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          name="quantity"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, e)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          min="1"
                          required
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          name="unitPrice"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, e)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          min="0"
                          step="0.01"
                          required
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Intl.NumberFormat('en-ZA', {
                          style: 'currency',
                          currency: 'ZAR',
                          minimumFractionDigits: 2,
                        }).format(item.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-900"
                          disabled={formData.items.length <= 1}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="flex justify-end">
                <div className="w-1/2 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal (Excl. VAT):</span>
                    <span>
                      {new Intl.NumberFormat('en-ZA', {
                        style: 'currency',
                        currency: 'ZAR',
                      }).format(formData.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">VAT @15%:</span>
                    <span>
                      {new Intl.NumberFormat('en-ZA', {
                        style: 'currency',
                        currency: 'ZAR',
                      }).format(formData.vat)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <span className="font-bold">Total Due:</span>
                    <span className="font-bold">
                      {new Intl.NumberFormat('en-ZA', {
                        style: 'currency',
                        currency: 'ZAR',
                      }).format(formData.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-medium">Payment Details</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">Bank Name</label>
              <input
                type="text"
                id="bankName"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="accountName" className="block text-sm font-medium text-gray-700">Account Name</label>
              <input
                type="text"
                id="accountName"
                name="accountName"
                value={formData.accountName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Account Number</label>
              <input
                type="text"
                id="accountNumber"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="branchCode" className="block text-sm font-medium text-gray-700">Branch Code</label>
              <input
                type="text"
                id="branchCode"
                name="branchCode"
                value={formData.branchCode}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button onClick={() => navigate('/invoices')} type="button" className="mr-2 bg-gray-600 hover:bg-gray-700">
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoicePage;
