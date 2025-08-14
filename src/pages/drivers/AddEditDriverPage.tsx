import { doc, getDoc, getFirestore } from "firebase/firestore";
import { ArrowLeft, FileText } from "lucide-react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import EnhancedDriverForm from "../../components/forms/driver/EnhancedDriverForm";
import { Button } from "../../components/ui/Button";
import useOfflineForm from "../../hooks/useOfflineForm";

// Import DriverData interface
import type { DriverData } from "../../types/Details";

const AddEditDriverPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const db = getFirestore();
  const isEditMode = !!id;

  // State for driver data
  const [driver, setDriver] = React.useState<Partial<DriverData> | null>(null);
  const [loading, setLoading] = React.useState<boolean>(isEditMode);
  const [error, setError] = React.useState<Error | null>(null);

  // Fetch driver data if in edit mode
  React.useEffect(() => {
    const fetchDriver = async () => {
      if (!isEditMode) return;

      try {
        const driverDoc = await getDoc(doc(db, "drivers", id as string));
        if (driverDoc.exists()) {
          setDriver(driverDoc.data() as Partial<DriverData>);
        } else {
          setError(new Error("Driver not found"));
        }
      } catch (err) {
        console.error("Error fetching driver:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchDriver();
  }, [db, id, isEditMode]);

  // Offline form handling
  const { submit } = useOfflineForm({
    collectionPath: "drivers",
    showOfflineWarning: true,
    onSuccess: () => {
      // Navigate back to drivers list or detail page
      if (isEditMode) {
        navigate(`/drivers/profiles/${id}`);
      } else {
        navigate("/drivers/profiles");
      }
    },
  });

  const handleSubmit = async (data: DriverData) => {
    try {
      await submit(data, id);
    } catch (error) {
      console.error("Error saving driver data:", error);
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      navigate(`/drivers/profiles/${id}`);
    } else {
      navigate("/drivers/profiles");
    }
  };

  // Show loading state
  if (isEditMode && loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error state
  if (isEditMode && error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FileText className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Driver</h3>
              <p className="text-sm text-red-700 mt-1">
                {error.message || "Failed to load driver details. Please try again."}
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/drivers/profiles")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Drivers
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <EnhancedDriverForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        initialData={driver as Partial<DriverData>}
        driverId={id}
        isEditMode={isEditMode}
      />
    </div>
  );
};

export default AddEditDriverPage;
