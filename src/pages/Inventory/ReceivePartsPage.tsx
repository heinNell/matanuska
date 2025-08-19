import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PartsReceivingForm from "../../components/forms/workshop/PartsReceivingForm";
import PageWrapper from "../../components/ui/PageWrapper";
import { db } from "../../firebase";

// Interface for parts being received
interface PartToReceive {
  id: string;
  sku: string;
  description: string;
  orderQuantity: number;
  receivingQuantity: number;
  unitPrice?: number;
  manufacturer?: string;
  supplier?: string;
  serialNumber?: string;
  isSerial: boolean;
  notes?: string;
  poNumber?: string;
  status: "pending" | "received" | "partial" | "damaged";
}

// Interface for purchase order parts (matching the data structure used in the component)
interface OrderPart {
  id: string;
  sku: string;
  description: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitPrice: number;
  status: "PENDING" | "ORDERED" | "RECEIVED" | "PARTIALLY_RECEIVED" | "CANCELLED";
}

/**
 * Receive Parts Page
 * Used for receiving incoming parts shipments and updating inventory
 */
const ReceivePartsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const poNumber = searchParams.get("poNumber");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleReceiveParts = async (receivedParts: PartToReceive[]) => {
    try {
      setIsLoading(true);
      console.log("Parts received:", receivedParts);

      // 1. Update inventory quantities in Firestore
      for (const part of receivedParts) {
        // Check if part exists in inventory
        const partsQuery = query(collection(db, "parts"), where("sku", "==", part.sku));

        const partsSnapshot = await getDocs(partsQuery);

        if (!partsSnapshot.empty) {
          // Update existing part quantity
          const partDoc = partsSnapshot.docs[0]!; // non-null: guarded by empty check
          const qtyRaw = partDoc.data().quantity ?? 0;
          const currentQuantity =
            typeof qtyRaw === "number" ? qtyRaw : Number.parseInt(String(qtyRaw), 10) || 0;
          await updateDoc(doc(db, "parts", partDoc.id), {
            quantity: currentQuantity + part.receivingQuantity,
            lastUpdated: serverTimestamp(),
          });
        } else {
          // Add new part to inventory
          await addDoc(collection(db, "parts"), {
            sku: part.sku,
            description: part.description,
            quantity: part.receivingQuantity,
            cost: part.unitPrice || 0,
            itemType: "part",
            site: "main",
            manufacturer: part.manufacturer || "Unknown",
            supplier: part.supplier || "Unknown",
            createdAt: serverTimestamp(),
            lastUpdated: serverTimestamp(),
          });
        }
      }

      // 2. Update purchase order status if poNumber is provided
      if (poNumber) {
        const poQuery = query(collection(db, "partOrders"), where("orderNumber", "==", poNumber));

        const poSnapshot = await getDocs(poQuery);

        if (!poSnapshot.empty) {
          const orderDoc = poSnapshot.docs[0]!; // non-null: guarded by empty check
          const orderData = orderDoc.data();

          // Update parts status
          const updatedParts = orderData.parts.map((orderPart: OrderPart) => {
            const receivedPart = receivedParts.find((rp) => rp.sku === orderPart.sku);

            if (receivedPart) {
              return {
                ...orderPart,
                quantityReceived:
                  (orderPart.quantityReceived || 0) + receivedPart.receivingQuantity,
                status:
                  receivedPart.receivingQuantity >= orderPart.quantityOrdered
                    ? "RECEIVED"
                    : "PARTIALLY_RECEIVED",
              };
            }
            return orderPart;
          });

          // Determine overall order status
          const allReceived = updatedParts.every((part: OrderPart) => part.status === "RECEIVED");
          const anyReceived = updatedParts.some(
            (part: OrderPart) => part.status === "RECEIVED" || part.status === "PARTIALLY_RECEIVED"
          );

          let orderStatus = orderData.status;
          if (allReceived) {
            orderStatus = "RECEIVED";
          } else if (anyReceived) {
            orderStatus = "PARTIALLY_RECEIVED";
          }

          await updateDoc(doc(db, "partOrders", orderDoc.id), {
            parts: updatedParts,
            status: orderStatus,
            lastUpdated: serverTimestamp(),
          });
        }
      }

      // 3. Create audit trail
      await addDoc(collection(db, "inventoryAudit"), {
        type: "RECEIVE_PARTS",
        poNumber: poNumber || "Direct Receipt",
        parts: receivedParts,
        timestamp: serverTimestamp(),
        userId: "current-user-id", // This should come from authentication context
      });

      // Show success message
      alert("Parts received successfully! Inventory has been updated.");
      navigate("/workshop/parts-inventory");
    } catch (error) {
      console.error("Error receiving parts:", error);
      alert("Failed to update inventory. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Navigate back or close form
    navigate(-1);
  };

  return (
    <PageWrapper title="Receive Parts">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Receive Parts Shipment</h1>
          <p className="text-gray-600">
            Record incoming parts and update inventory levels. Use this form when parts arrive from
            suppliers.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="ml-3">Processing your request...</p>
          </div>
        ) : (
          <PartsReceivingForm
            onSubmit={handleReceiveParts}
            onCancel={handleCancel}
            poNumber={poNumber || undefined}
          />
        )}
      </div>
    </PageWrapper>
  );
};

export default ReceivePartsPage;
