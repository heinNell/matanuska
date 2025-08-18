import { collection, doc, getDoc, getDocs, getFirestore, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader } from '../../components/ui';
// Using our custom formatDate helper instead of date-fns

interface DriverAuthorization {
  authorization: string;
  issueDate: string | null;
  expireDate: string | null;
  authRef: string | null;
  authorised: string;
}

interface Driver {
  id: string;
  idNo: string;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  status: string;
  joinDate?: string;
  profileImage?: string;
}

const DriverDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [authorizations, setAuthorizations] = useState<DriverAuthorization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const db = getFirestore();

  useEffect(() => {
    const fetchDriverData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Get driver details from Firestore
        const driverRef = doc(db, 'drivers', id);
        const driverSnap = await getDoc(driverRef);

        if (!driverSnap.exists()) {
          setError('Driver not found');
          setLoading(false);
          return;
        }

        const driverData = driverSnap.data();
        setDriver({
          id: driverSnap.id,
          idNo: driverData.idNo || '',
          name: driverData.name || '',
          surname: driverData.surname || '',
          email: driverData.email,
          phone: driverData.phone,
          licenseNumber: driverData.licenseNumber,
          dateOfBirth: driverData.dateOfBirth,
          address: driverData.address,
          emergencyContact: driverData.emergencyContact,
          status: driverData.status || 'Active',
          joinDate: driverData.joinDate,
          profileImage: driverData.profileImage
        });

        // Fetch driver authorizations if idNo exists
        if (driverData.idNo) {
          const authQuery = query(
            collection(db, 'authorizations'),
            where('idNo', '==', driverData.idNo)
          );

          const authSnap = await getDocs(authQuery);
          const authData: DriverAuthorization[] = [];

          authSnap.forEach((doc) => {
            const data = doc.data() as DriverAuthorization;
            authData.push(data);
          });

          setAuthorizations(authData);
        }
      } catch (err) {
        console.error('Error fetching driver data:', err);
        setError('Failed to fetch driver data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [id, db]);

  const handleEdit = () => {
    navigate(`/drivers/edit/${id}`);
  };

  const handleBack = () => {
    navigate('/drivers/profiles');
  };

  // Function to check if a document is expiring soon (within 90 days)
  const isExpiringSoon = (expireDate: string | null): boolean => {
    if (!expireDate) return false;

    try {
      // Parse the expiration date (assuming format DD/MM/YYYY)
      const parts = expireDate.split('/');
      if (parts.length !== 3) return false; // Ensure we have exactly 3 parts

      const day = parts[0];
      const month = parts[1];
      const year = parts[2];

      if (!day || !month || !year) return false; // Ensure all parts exist

      const expiryDate = new Date(
        parseInt(year), // Year
        parseInt(month) - 1, // Month (0-based)
        parseInt(day) // Day
      );

      // Calculate days until expiry
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays >= 0 && diffDays <= 90;
    } catch (err) {
      console.error('Error parsing date:', err);
      return false;
    }
  };

  // Function to check if a document is expired
  const isExpired = (expireDate: string | null): boolean => {
    if (!expireDate) return false;

    try {
      // Parse the expiration date (assuming format DD/MM/YYYY)
      const parts = expireDate.split('/');
      if (parts.length !== 3) return false; // Ensure we have exactly 3 parts

      const day = parts[0];
      const month = parts[1];
      const year = parts[2];

      if (!day || !month || !year) return false; // Ensure all parts exist

      const expiryDate = new Date(
        parseInt(year), // Year
        parseInt(month) - 1, // Month (0-based)
        parseInt(day) // Day
      );

      // Check if expired
      return expiryDate < new Date();
    } catch (err) {
      console.error('Error parsing date:', err);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <Button onClick={handleBack}>Back to Drivers</Button>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">No driver data found</p>
            </div>
          </div>
        </div>
        <Button onClick={handleBack}>Back to Drivers</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Driver Profile</h1>
        <div className="space-x-2">
          <Button onClick={handleBack}>Back</Button>
          <Button onClick={handleEdit}>Edit Profile</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Driver Information Card */}
        <Card className="col-span-1">
          <CardHeader className="bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Personal Information</h2>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                driver.status === 'Active' ? 'bg-green-100 text-green-800' :
                driver.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {driver.status}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-4">
              {driver.profileImage ? (
                <img
                  src={driver.profileImage}
                  alt={`${driver.name} ${driver.surname}`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-4xl text-gray-500">
                    {driver.name.charAt(0)}{driver.surname.charAt(0)}
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold mt-2">{driver.name} {driver.surname}</h3>
              <p className="text-sm text-gray-500">ID: {driver.idNo || 'Not available'}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between border-b border-gray-100 py-2">
                <span className="text-gray-500">Email</span>
                <span>{driver.email || 'Not available'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-2">
                <span className="text-gray-500">Phone</span>
                <span>{driver.phone || 'Not available'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-2">
                <span className="text-gray-500">Date of Birth</span>
                <span>{driver.dateOfBirth || 'Not available'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-2">
                <span className="text-gray-500">Join Date</span>
                <span>{driver.joinDate || 'Not available'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">License</span>
                <span>{driver.licenseNumber || 'Not available'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver Documents and Authorizations */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-medium">Documents & Authorizations</h2>
          </CardHeader>
          <CardContent>
            {authorizations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {authorizations.map((doc, index) => (
                      <tr key={`${doc.authorization}-${index}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {doc.authorization}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.authRef || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.issueDate || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.expireDate || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isExpired(doc.expireDate) ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Expired
                            </span>
                          ) : isExpiringSoon(doc.expireDate) ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Expiring Soon
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Valid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No authorization documents found for this driver.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information (can be expanded later) */}
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-medium">Additional Information</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium mb-2">Contact Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-gray-100 py-2">
                    <span className="text-gray-500">Address</span>
                    <span>{driver.address || 'Not available'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 py-2">
                    <span className="text-gray-500">Emergency Contact</span>
                    <span>{driver.emergencyContact || 'Not available'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-md font-medium mb-2">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => navigate(`/drivers/performance?driver=${id}`)}>
                    View Performance
                  </Button>
                  <Button onClick={() => navigate(`/trips?driver=${id}`)}>
                    View Trips
                  </Button>
                  <Button onClick={() => navigate(`/drivers/behavior?driver=${id}`)}>
                    Behavior Analysis
                  </Button>
                  <Button onClick={() => navigate(`/drivers/safety-scores?driver=${id}`)}>
                    Safety Scores
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverDetailsPage;
