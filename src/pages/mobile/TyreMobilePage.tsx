import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/mobile/MobileLayout';
import MobileNavigation from '../../components/mobile/MobileNavigation';
import TyreListMobile from '../../components/mobile/tyre/TyreListMobile';
import TyreInspectionMobile from '../../components/mobile/tyre/TyreInspectionMobile';
import TyreScanner from '../../components/mobile/tyre/TyreScanner';
import TyreFormModal from '../../components/Models/Tyre/TyreFormModal';
import { collection, query, getDocs, orderBy, addDoc, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface TyreMobilePageProps {
  mode?: 'list' | 'inspection' | 'scanner' | 'add';
  tyreId?: string;
}

const TyreMobilePage: React.FC<TyreMobilePageProps> = ({
  mode = 'list',
  tyreId
}) => {
  const navigate = useNavigate();
  const [currentMode, setCurrentMode] = useState(mode);
  const [tyres, setTyres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTyre, setSelectedTyre] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);

  useEffect(() => {
    setIsNativeApp(Capacitor.isNativePlatform());
    fetchTyres();
    
    // If tyreId is provided, fetch and select that specific tyre
    if (tyreId) {
      fetchSpecificTyre(tyreId);
    }
  }, [tyreId]);
  
  const fetchSpecificTyre = async (id: string) => {
    try {
      // First try to find the tyre in the already loaded tyres
      const existingTyre = tyres.find(tyre => tyre.id === id);
      
      if (existingTyre) {
        setSelectedTyre(existingTyre);
        // If in list mode, switch to inspection mode for the selected tyre
        if (currentMode === 'list') {
          setCurrentMode('inspection');
        }
      } else {
        // If not found in the current list, fetch it directly
        // Import getDoc at the top of the file if not already imported
        const tyreDoc = doc(db, 'tyres', id);
        const docSnap = await getDoc(tyreDoc);
        
        if (docSnap.exists()) {
          const tyreData = { id: docSnap.id, ...docSnap.data() };
          setSelectedTyre(tyreData);
          // If in list mode, switch to inspection mode for the selected tyre
          if (currentMode === 'list') {
            setCurrentMode('inspection');
          }
        } else {
          console.error('Tyre not found with ID:', id);
        }
      }
    } catch (error) {
      console.error('Error fetching specific tyre:', error);
    }
  };

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  const fetchTyres = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'tyres'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const tyresList: any[] = [];
      querySnapshot.forEach((doc) => {
        tyresList.push({ id: doc.id, ...doc.data() });
      });
      
      setTyres(tyresList);
    } catch (error) {
      console.error('Error fetching tyres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScanTyre = (tyre: any) => {
    setSelectedTyre(tyre);
    setCurrentMode('inspection');
  };

  const handleEditTyre = (tyre: any) => {
    setSelectedTyre(tyre);
    setShowAddModal(true);
  };

  const handleViewDetails = (tyre: any) => {
    setSelectedTyre(tyre);
    // Navigate to detailed view or open modal
    navigate(`/tyres/${tyre.id}`);
  };

  const handleAddNew = () => {
    setSelectedTyre(null);
    setShowAddModal(true);
  };

  const handleScanComplete = (scanData: { barcode?: string; photo?: string }) => {
    if (scanData.barcode) {
      const foundTyre = tyres.find(tyre => 
        tyre.tyreNumber === scanData.barcode ||
        tyre.id === scanData.barcode
      );
      
      if (foundTyre) {
        handleScanTyre(foundTyre);
      } else {
        // Start inspection for new tyre
        setSelectedTyre({ tyreNumber: scanData.barcode });
        setCurrentMode('inspection');
      }
    }
    
    if (currentMode === 'scanner') {
      setCurrentMode('list');
    }
  };

  const handleInspectionSave = async (inspectionData: any) => {
    try {
      // Save inspection to Firebase
      await addDoc(collection(db, 'tyreInspections'), {
        ...inspectionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update tyre's last inspection date
      if (inspectionData.tyreId) {
        const tyreRef = doc(db, 'tyres', inspectionData.tyreId);
        await updateDoc(tyreRef, {
          lastInspection: inspectionData.inspectionDate,
          updatedAt: serverTimestamp()
        });
      }

      // Refresh tyres list
      await fetchTyres();
      
      // Return to list view
      setCurrentMode('list');
      setSelectedTyre(null);
    } catch (error) {
      console.error('Error saving inspection:', error);
      throw error;
    }
  };

  const handleTyreSave = async (tyreData: any) => {
    try {
      if (selectedTyre?.id) {
        // Update existing tyre
        const tyreRef = doc(db, 'tyres', selectedTyre.id);
        await updateDoc(tyreRef, {
          ...tyreData,
          updatedAt: serverTimestamp()
        });
      } else {
        // Add new tyre
        await addDoc(collection(db, 'tyres'), {
          ...tyreData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      // Refresh tyres list
      await fetchTyres();
      
      // Close modal
      setShowAddModal(false);
      setSelectedTyre(null);
    } catch (error) {
      console.error('Error saving tyre:', error);
      throw error;
    }
  };

  const renderContent = () => {
    switch (currentMode) {
      case 'inspection':
        return (
          <TyreInspectionMobile
            tyreId={selectedTyre?.id}
            tyreNumber={selectedTyre?.tyreNumber}
            onSave={handleInspectionSave}
            onCancel={() => {
              setCurrentMode('list');
              setSelectedTyre(null);
            }}
          />
        );

      case 'scanner':
        return (
          <TyreScanner
            scanMode="barcode"
            title="Scan Tyre QR Code"
            onScanComplete={handleScanComplete}
            onCancel={() => setCurrentMode('list')}
          />
        );

      case 'list':
      default:
        return (
          <>
            <TyreListMobile
              tyres={tyres}
              loading={loading}
              onRefresh={fetchTyres}
              onAddNew={handleAddNew}
              onScanTyre={handleScanTyre}
              onEditTyre={handleEditTyre}
              onViewDetails={handleViewDetails}
              enableScanner={isNativeApp}
            />
            
            {/* Bottom navigation - only show in list mode */}
            <MobileNavigation
              onNewTyre={handleAddNew}
              onScanTyre={() => setCurrentMode('scanner')}
              notificationCount={tyres.filter(t => 
                !t.lastInspection || 
                new Date(t.lastInspection) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              ).length}
            />
          </>
        );
    }
  };

  return (
    <MobileLayout
      title="Tyre Management"
      showStatusBar={true}
      statusBarStyle="dark"
      backgroundColor="#ffffff"
    >
      {renderContent()}

      {/* Add/Edit Tyre Modal */}
      {showAddModal && (
        <TyreFormModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedTyre(null);
          }}
          initialData={selectedTyre}
          onSubmit={handleTyreSave}
          editMode={!!selectedTyre?.id}
        />
      )}

      {/* Mobile-specific styles */}
      <style>{`
        /* Ensure content doesn't go behind navigation */
        .mobile-content {
          padding-bottom: 80px; /* Account for bottom navigation */
        }

        /* Optimize for mobile performance */
        * {
          box-sizing: border-box;
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Prevent horizontal scroll */
        body {
          overflow-x: hidden;
        }

        /* Touch-friendly interactive elements */
        button, 
        .clickable {
          min-height: 44px;
          min-width: 44px;
        }

        /* Optimize text for mobile readability */
        body {
          font-size: 16px;
          line-height: 1.5;
        }

        /* Reduce animations on lower-end devices */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Optimize for PWA */
        @media all and (display-mode: standalone) {
          body {
            padding-top: env(safe-area-inset-top);
          }
        }
      `}</style>
    </MobileLayout>
  );
};

export default TyreMobilePage;
