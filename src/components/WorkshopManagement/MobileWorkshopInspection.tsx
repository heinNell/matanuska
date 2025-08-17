import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Textarea } from "../../components/ui/textarea";
import { mobileFirebaseConfig } from "../../config/mobileConfig";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import {
  inspectionTemplates,
  type InspectionItem,
  type InspectionTemplate,
} from "../../data/inspectionTemplates";
import { useToast } from "../../hooks/use-toast";
import { useCapacitor } from "../../hooks/useCapacitor";
import {
  AlertTriangle,
  Calendar,
  Camera,
  CheckCircle,
  MapPin,
  Play,
  Save,
  Truck,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addDoc, collection, db, serverTimestamp } from "../../firebase";

interface InspectionFormData {
  vehicleId: string;
  templateId: string;
  inspectionType: string;
  inspectorName: string;
  driverName: string;
  status: "not_started" | "in_progress" | "completed";
  startTime?: Date;
  endTime?: Date;
  scheduledDate: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  items: Array<{
    id: string;
    status: "pass" | "fail" | "na" | "pending";
    notes?: string;
    photos?: string[];
  }>;
  generalNotes: string;
  defectsFound: number;
  criticalIssues: number;
}

interface InspectionPhoto {
  id: string;
  itemId: string;
  base64: string;
  timestamp: Date;
  location?: { lat: number; lng: number };
}

export const MobileWorkshopInspection: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isNative, takePhoto, hasPermissions, requestPermissions } = useCapacitor();

  const [formData, setFormData] = useState<InspectionFormData>({
    vehicleId: searchParams.get("vehicleId") || "",
    templateId: searchParams.get("templateId") || "",
    inspectionType: searchParams.get("inspectionType") || "daily",
    inspectorName: "",
    driverName: "",
    status: "not_started",
    scheduledDate: searchParams.get("scheduledDate") || new Date().toISOString().split("T")[0],
    items: [],
    generalNotes: "",
    defectsFound: 0,
    criticalIssues: 0,
  });

  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [template, setTemplate] = useState<InspectionTemplate | null>(null);
  const [photos, setPhotos] = useState<InspectionPhoto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load template and initialize form
    const loadTemplate = () => {
      const foundTemplate = inspectionTemplates.find(
        (template: InspectionTemplate) => template.id === formData.templateId
      );
      if (foundTemplate) {
        setTemplate(foundTemplate);
        setFormData((prev) => ({
          ...prev,
          items: foundTemplate.items.map((item: InspectionItem) => ({
            id: item.id,
            status: "pending" as const,
            notes: "",
            photos: [],
          })),
        }));
        // Set first category as current
        if (foundTemplate.categories.length > 0) {
          setCurrentCategory(foundTemplate.categories[0]);
        }
      }
    };

    loadTemplate();

    // Get current location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          }));
        },
        (error) => console.log("Location not available:", error)
      );
    }
  }, [formData.templateId]);

  const getCategories = () => {
    if (!template) return [];
    return template.categories;
  };

  const getCurrentCategoryItems = () => {
    if (!template || !currentCategory) return [];
    return template.items.filter((item) => item.category === currentCategory);
  };

  const handleStartInspection = () => {
    setFormData((prev) => ({
      ...prev,
      status: "in_progress",
      startTime: new Date(),
    }));
    toast({
      title: "Inspection Started",
      description: `Starting ${formData.inspectionType} inspection for ${formData.vehicleId}`,
    });
  };

  const handleItemStatusChange = (itemId: string, status: "pass" | "fail" | "na") => {
    setFormData((prev) => {
      const updatedItems = prev.items.map((item) =>
        item.id === itemId ? { ...item, status } : item
      );

      // Recalculate defects and critical issues
      const defectsFound = updatedItems.filter((item) => item.status === "fail").length;
      const criticalIssues = updatedItems.filter((item) => {
        const templateItem = template?.items.find((ti) => ti.id === item.id);
        return item.status === "fail" && templateItem?.isCritical;
      }).length;

      return {
        ...prev,
        items: updatedItems,
        defectsFound,
        criticalIssues,
      };
    });
  };

  const handleItemNotesChange = (itemId: string, notes: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === itemId ? { ...item, notes } : item)),
    }));
  };

  const handleTakePhoto = async (itemId: string) => {
    if (!isNative) {
      toast({
        title: "Camera Not Available",
        description: "Camera functionality is only available in the mobile app",
        variant: "destructive",
      });
      return;
    }

    if (!hasPermissions) {
      const granted = await requestPermissions();
      if (!granted) {
        toast({
          title: "Camera Permission Required",
          description: "Please grant camera permission to take photos",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const photoBase64 = await takePhoto();
      if (photoBase64) {
        const newPhoto: InspectionPhoto = {
          id: Date.now().toString(),
          itemId,
          base64: photoBase64,
          timestamp: new Date(),
          location: formData.location
            ? {
                lat: formData.location.latitude,
                lng: formData.location.longitude,
              }
            : undefined,
        };

        setPhotos((prev) => [...prev, newPhoto]);

        // Update item with photo reference
        setFormData((prev) => ({
          ...prev,
          items: prev.items.map((item) =>
            item.id === itemId ? { ...item, photos: [...(item.photos || []), newPhoto.id] } : item
          ),
        }));

        toast({
          title: "Photo Captured",
          description: "Photo added to inspection item",
        });
      }
    } catch (error) {
      console.error("Photo capture failed:", error);
      toast({
        title: "Photo Capture Failed",
        description: "Unable to capture photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteInspection = async () => {
    if (!formData.inspectorName) {
      toast({
        title: "Inspector Required",
        description: "Please enter inspector name before completing",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const completedInspection = {
        ...formData,
        status: "completed" as const,
        endTime: new Date(),
        photos: photos,
        timestamp: serverTimestamp(),
        source: "mobile_qr",
        mobileApp: {
          packageName: "matmobile.com",
          version: "1.0.0",
          platform: "android",
        },
        firebaseProject: {
          projectId: mobileFirebaseConfig.projectId,
          appId: mobileFirebaseConfig.appId,
        },
        offlineCapable: true,
      };

      // Save to Firebase with offline persistence
      const docRef = await addDoc(collection(db, "inspections"), completedInspection);

      // If there are failed items, create faults automatically
      if (formData.defectsFound > 0) {
        const failedItems = formData.items.filter((item) => item.status === "fail");
        for (const item of failedItems) {
          const templateItem = template?.items.find((ti) => ti.id === item.id);
          if (templateItem) {
            await addDoc(collection(db, "faults"), {
              vehicleId: formData.vehicleId,
              faultType: templateItem.category,
              description: `${templateItem.title}: ${item.notes || "Failed inspection"}`,
              severity: templateItem.isCritical ? "critical" : "minor",
              status: "open",
              reportedBy: formData.inspectorName,
              inspectionId: docRef.id,
              timestamp: serverTimestamp(),
              location: formData.location,
              source: "mobile_inspection",
              mobileData: {
                appId: mobileFirebaseConfig.appId,
                packageName: "matmobile.com",
              },
            });
          }
        }
      }

      // Store data locally for offline access if needed
      if ("localStorage" in window) {
        const localData = {
          inspectionId: docRef.id,
          vehicleId: formData.vehicleId,
          status: "completed",
          timestamp: new Date().toISOString(),
          synced: true,
        };
        localStorage.setItem(`inspection_${docRef.id}`, JSON.stringify(localData));
      }

      toast({
        title: "Inspection Completed",
        description: `Inspection saved to Firebase (${mobileFirebaseConfig.projectId}). ${formData.defectsFound > 0 ? "Faults created for failed items." : ""}`,
      });

      // Navigate back or to next inspection
      navigate("/workshop/inspections");
    } catch (error) {
      console.error("Error saving inspection:", error);

      // Store offline if Firebase fails
      if ("localStorage" in window) {
        const offlineData = {
          ...formData,
          status: "completed" as const,
          endTime: new Date(),
          photos: photos,
          timestamp: new Date().toISOString(),
          source: "mobile_qr_offline",
          synced: false,
          offlineId: `offline_${Date.now()}`,
        };
        localStorage.setItem(`offline_inspection_${Date.now()}`, JSON.stringify(offlineData));

        toast({
          title: "Saved Offline",
          description: "Inspection saved locally. Will sync when connection is restored.",
          variant: "default",
        });
      } else {
        toast({
          title: "Save Failed",
          description: "Unable to save inspection. Please check connection and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusStats = () => {
    const total = formData.items.length;
    const passed = formData.items.filter((item) => item.status === "pass").length;
    const failed = formData.items.filter((item) => item.status === "fail").length;
    const na = formData.items.filter((item) => item.status === "na").length;
    const pending = formData.items.filter((item) => item.status === "pending").length;

    return { total, passed, failed, na, pending };
  };

  if (!template) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">Template Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The inspection template could not be loaded. Please check the QR code and try again.
            </p>
            <Button onClick={() => navigate("/workshop/inspections")}>Back to Inspections</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = getStatusStats();
  const categories = getCategories();
  const currentItems = getCurrentCategoryItems();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold">Mobile Inspection</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="w-4 h-4" />
              <span>{formData.vehicleId}</span>
              <Badge variant="outline">{template.name}</Badge>
            </div>
          </div>
          <Badge
            variant={formData.status === "completed" ? "default" : "secondary"}
            className={
              formData.status === "completed"
                ? "bg-green-500"
                : formData.status === "in_progress"
                  ? "bg-blue-500"
                  : "bg-gray-500"
            }
          >
            {formData.status.replace("_", " ").toUpperCase()}
          </Badge>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-green-50 p-2 rounded">
            <div className="text-sm font-semibold text-green-600">{stats.passed}</div>
            <div className="text-xs text-green-600">Passed</div>
          </div>
          <div className="bg-red-50 p-2 rounded">
            <div className="text-sm font-semibold text-red-600">{stats.failed}</div>
            <div className="text-xs text-red-600">Failed</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-sm font-semibold text-gray-600">{stats.na}</div>
            <div className="text-xs text-gray-600">N/A</div>
          </div>
          <div className="bg-yellow-50 p-2 rounded">
            <div className="text-sm font-semibold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-yellow-600">Pending</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Inspector Info */}
        {formData.status === "not_started" && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Inspection Details
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Inspector Name</label>
                <Input
                  value={formData.inspectorName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({ ...prev, inspectorName: e.target.value }))
                  }
                  placeholder="Enter inspector name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Driver Name (Optional)</label>
                <Input
                  value={formData.driverName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({ ...prev, driverName: e.target.value }))
                  }
                  placeholder="Enter driver name if present"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Scheduled: {formData.scheduledDate}</span>
              </div>
              {formData.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Location captured</span>
                </div>
              )}
              <Button onClick={handleStartInspection} className="w-full">
                <Play className="w-4 h-4 mr-2" />
                Start Inspection
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Category Navigation */}
        {formData.status === "in_progress" && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={currentCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category.replace("_", " ")}
                </Button>
              ))}
            </div>

            {/* Inspection Items */}
            <div className="space-y-3">
              {currentItems.map((item: InspectionItem) => {
                const itemData = formData.items.find((i) => i.id === item.id);
                const itemPhotos = photos.filter((p) => p.itemId === item.id);

                return (
                  <Card key={item.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm mb-1">{item.title}</h3>
                          {item.isCritical && (
                            <Badge variant="destructive" className="text-xs">
                              Critical
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Status Buttons */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <Button
                          variant={itemData?.status === "pass" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleItemStatusChange(item.id, "pass")}
                          className={
                            itemData?.status === "pass" ? "bg-green-500 hover:bg-green-600" : ""
                          }
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Pass
                        </Button>
                        <Button
                          variant={itemData?.status === "fail" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleItemStatusChange(item.id, "fail")}
                          className={
                            itemData?.status === "fail" ? "bg-red-500 hover:bg-red-600" : ""
                          }
                        >
                          <X className="w-4 h-4 mr-1" />
                          Fail
                        </Button>
                        <Button
                          variant={itemData?.status === "na" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleItemStatusChange(item.id, "na")}
                        >
                          N/A
                        </Button>
                      </div>

                      {/* Notes and Photos */}
                      {(itemData?.status === "fail" || itemData?.notes) && (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Add notes for this item..."
                            value={itemData?.notes || ""}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                              handleItemNotesChange(item.id, e.target.value)
                            }
                            className="text-sm"
                            rows={2}
                          />

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTakePhoto(item.id)}
                              disabled={!isNative}
                            >
                              <Camera className="w-4 h-4 mr-1" />
                              Take Photo ({itemPhotos.length})
                            </Button>
                          </div>

                          {/* Photo Thumbnails */}
                          {itemPhotos.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {itemPhotos.map((photo) => (
                                <div
                                  key={photo.id}
                                  className="w-16 h-16 bg-gray-100 rounded border overflow-hidden"
                                >
                                  <img
                                    src={`data:image/jpeg;base64,${photo.base64}`}
                                    alt="Inspection photo"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* General Notes */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">General Notes</h2>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add any general observations or notes about the inspection..."
                  value={formData.generalNotes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData((prev) => ({ ...prev, generalNotes: e.target.value }))
                  }
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Complete Button */}
            <Button
              onClick={handleCompleteInspection}
              disabled={loading || stats.pending > 0}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Complete Inspection
              {stats.pending > 0 && ` (${stats.pending} items pending)`}
            </Button>
          </>
        )}

        {/* Completed State */}
        {formData.status === "completed" && (
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h2 className="text-xl font-semibold mb-2">Inspection Completed</h2>
              <p className="text-muted-foreground mb-4">Inspection has been saved successfully.</p>
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <div className="font-medium">Defects Found</div>
                  <div className="text-2xl font-bold text-red-600">{formData.defectsFound}</div>
                </div>
                <div>
                  <div className="font-medium">Critical Issues</div>
                  <div className="text-2xl font-bold text-red-600">{formData.criticalIssues}</div>
                </div>
              </div>
              <Button onClick={() => navigate("/workshop/inspections")}>Back to Inspections</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MobileWorkshopInspection;
