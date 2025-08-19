import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, Button } from '../../components/ui';

interface QuoteFormData {
  quoteNumber: string;
  dateIssued: string;
  validUntil: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientPhone: string;
  transportRoute: string;
  distance: string;
  commodity: string;
  truckType: string;
  trailerType: string;
  temperature: string;
  ratePerTrip: number;
  rateBasis: string;
  tollCharges: string;
  fuelSurcharge: string;
  vat: number;
  total: number;
  validityDays: number;
  truckAvailabilityNote: boolean;
  podRequiredNote: boolean;
  loadingTimeNote: { active: boolean; hours: number; rate: number };
}

const CreateQuotePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const today = new Date().toISOString().slice(0, 10);
  const fourteenDaysLater = new Date();
  fourteenDaysLater.setDate(fourteenDaysLater.getDate() + 14);
  const fourteenDaysLaterStr = fourteenDaysLater.toISOString().slice(0, 10);
  
  const generateQuoteNumber = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `Q-${randomNum}`;
  };
  
  const [formData, setFormData] = useState<QuoteFormData>({
    quoteNumber: generateQuoteNumber(),
    dateIssued: today,
    validUntil: fourteenDaysLaterStr,
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    transportRoute: '',
    distance: '',
    commodity: '',
    truckType: 'Reefer',
    trailerType: 'Tri-Axle',
    temperature: '',
    ratePerTrip: 0,
    rateBasis: 'Per Load',
    tollCharges: 'Included',
    fuelSurcharge: 'Included',
    vat: 0,
    total: 0,
    validityDays: 14,
    truckAvailabilityNote: true,
    podRequiredNote: true,
    loadingTimeNote: { active: true, hours: 3, rate: 350 }
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      const typedName = name as keyof QuoteFormData;
      const base: QuoteFormData = { ...prevData, [typedName]: value } as QuoteFormData;

      if (typedName === 'ratePerTrip') {
        const rate = parseFloat(String(value)) || 0;
        const vat = rate * 0.15;
        const total = rate + vat;
        return { ...base, vat, total } as QuoteFormData;
      }

      if (typedName === 'validityDays') {
        const days = parseInt(String(value)) || 0;
        const validDate = new Date();
        validDate.setDate(validDate.getDate() + days);
        const validUntilStr = validDate.toISOString().slice(0, 10);
        return { ...base, validUntil: validUntilStr } as QuoteFormData;
      }

      return base;
    });
  };
  
  const handleCheckboxChange = (name: string) => {
    setFormData({
      ...formData,
      [name]: !formData[name as keyof QuoteFormData]
    });
  };
  
  const handleLoadingTimeChange = (field: 'active' | 'hours' | 'rate', value: boolean | number) => {
    setFormData({
      ...formData,
      loadingTimeNote: {
        ...formData.loadingTimeNote,
        [field]: value
      }
    });
  };
  
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rate = parseFloat(e.target.value) || 0;
    const vat = rate * 0.15; // 15% VAT
    const total = rate + vat;
    
    setFormData({
      ...formData,
      ratePerTrip: rate,
      vat,
      total
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const db = getFirestore();
      const quoteData = {
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'draft',
      };
      
      await addDoc(collection(db, 'quotes'), quoteData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/invoices');
      }, 2000);
    } catch (err) {
      console.error('Error creating quote:', err);
      setError('Failed to create quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Create New Transport Quotation</h1>
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
              <p className="text-sm text-green-700">Quote created successfully! Redirecting...</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-medium">Quote Information</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="quoteNumber" className="block text-sm font-medium text-gray-700">Quote No</label>
              <input
                type="text"
                id="quoteNumber"
                name="quoteNumber"
                value={formData.quoteNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="dateIssued" className="block text-sm font-medium text-gray-700">Date Issued</label>
              <input
                type="date"
                id="dateIssued"
                name="dateIssued"
                value={formData.dateIssued}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="validityDays" className="block text-sm font-medium text-gray-700">Valid For (Days)</label>
              <input
                type="number"
                id="validityDays"
                name="validityDays"
                value={formData.validityDays}
                onChange={handleInputChange}
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700">Valid Until</label>
              <input
                type="date"
                id="validUntil"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
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
            
            <div>
              <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="clientEmail"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                id="clientPhone"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-medium">Service Details</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="transportRoute" className="block text-sm font-medium text-gray-700">Transport Route (From → To)</label>
              <input
                type="text"
                id="transportRoute"
                name="transportRoute"
                value={formData.transportRoute}
                onChange={handleInputChange}
                placeholder="e.g. Johannesburg → Cape Town"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="distance" className="block text-sm font-medium text-gray-700">Distance (approx. in km)</label>
              <input
                type="text"
                id="distance"
                name="distance"
                value={formData.distance}
                onChange={handleInputChange}
                placeholder="e.g. 1400"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="commodity" className="block text-sm font-medium text-gray-700">Commodity</label>
              <input
                type="text"
                id="commodity"
                name="commodity"
                value={formData.commodity}
                onChange={handleInputChange}
                placeholder="e.g. Fresh Produce"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="truckType" className="block text-sm font-medium text-gray-700">Truck Type</label>
              <select
                id="truckType"
                name="truckType"
                value={formData.truckType}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              >
                <option value="Reefer">Reefer</option>
                <option value="Flatbed">Flatbed</option>
                <option value="Curtain Side">Curtain Side</option>
                <option value="Tanker">Tanker</option>
                <option value="Container">Container</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="trailerType" className="block text-sm font-medium text-gray-700">Trailer Type</label>
              <select
                id="trailerType"
                name="trailerType"
                value={formData.trailerType}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              >
                <option value="Tri-Axle">Tri-Axle</option>
                <option value="Interlink">Interlink</option>
                <option value="Super Link">Super Link</option>
                <option value="Flat Deck">Flat Deck</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">Temperature (if applicable)</label>
              <input
                type="text"
                id="temperature"
                name="temperature"
                value={formData.temperature}
                onChange={handleInputChange}
                placeholder="e.g. 2-8°C"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-medium">Pricing</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="ratePerTrip" className="block text-sm font-medium text-gray-700">Rate per Trip (ZAR)</label>
              <input
                type="number"
                id="ratePerTrip"
                name="ratePerTrip"
                value={formData.ratePerTrip}
                onChange={handleRateChange}
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="rateBasis" className="block text-sm font-medium text-gray-700">Rate Basis</label>
              <select
                id="rateBasis"
                name="rateBasis"
                value={formData.rateBasis}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              >
                <option value="Per Load">Per Load</option>
                <option value="Per Ton">Per Ton</option>
                <option value="Per Km">Per Km</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="tollCharges" className="block text-sm font-medium text-gray-700">Toll & Border Charges</label>
              <select
                id="tollCharges"
                name="tollCharges"
                value={formData.tollCharges}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              >
                <option value="Included">Included</option>
                <option value="Excluded">Excluded</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="fuelSurcharge" className="block text-sm font-medium text-gray-700">Fuel Surcharge</label>
              <select
                id="fuelSurcharge"
                name="fuelSurcharge"
                value={formData.fuelSurcharge}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              >
                <option value="Included">Included</option>
                <option value="Variable">Variable</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="vat" className="block text-sm font-medium text-gray-700">VAT @15%</label>
              <input
                type="text"
                id="vat"
                name="vat"
                value={new Intl.NumberFormat('en-ZA', {
                  style: 'currency',
                  currency: 'ZAR'
                }).format(formData.vat)}
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled
              />
            </div>
            
            <div>
              <label htmlFor="total" className="block text-sm font-medium text-gray-700">Total Quote (Incl. VAT)</label>
              <input
                type="text"
                id="total"
                name="total"
                value={new Intl.NumberFormat('en-ZA', {
                  style: 'currency',
                  currency: 'ZAR'
                }).format(formData.total)}
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 font-bold shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-medium">Terms & Conditions</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="truckAvailabilityNote"
                  name="truckAvailabilityNote"
                  type="checkbox"
                  checked={formData.truckAvailabilityNote}
                  onChange={() => handleCheckboxChange('truckAvailabilityNote')}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="truckAvailabilityNote" className="font-medium text-gray-700">Subject to truck availability at time of confirmation.</label>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="podRequiredNote"
                  name="podRequiredNote"
                  type="checkbox"
                  checked={formData.podRequiredNote}
                  onChange={() => handleCheckboxChange('podRequiredNote')}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="podRequiredNote" className="font-medium text-gray-700">POD required within 24 hours post delivery.</label>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="loadingTimeNote"
                  name="loadingTimeNote"
                  type="checkbox"
                  checked={formData.loadingTimeNote.active}
                  onChange={() => handleLoadingTimeChange('active', !formData.loadingTimeNote.active)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm flex items-center">
                <label htmlFor="loadingTimeNote" className="font-medium text-gray-700">All loading/unloading to be completed within</label>
                <input
                  type="number"
                  value={formData.loadingTimeNote.hours}
                  onChange={(e) => handleLoadingTimeChange('hours', parseInt(e.target.value) || 0)}
                  className="mx-2 w-16 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  disabled={!formData.loadingTimeNote.active}
                /> hours; delays billed at ZAR 
                <input
                  type="number"
                  value={formData.loadingTimeNote.rate}
                  onChange={(e) => handleLoadingTimeChange('rate', parseInt(e.target.value) || 0)}
                  className="mx-2 w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  disabled={!formData.loadingTimeNote.active}
                /> /hour.
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button onClick={() => navigate('/invoices')} type="button" className="mr-2 bg-gray-600 hover:bg-gray-700">
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Quote'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuotePage;
