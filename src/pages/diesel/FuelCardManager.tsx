import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import SyncIndicator from "@/components/ui/SyncIndicator";
import { AlertCircle, CheckCircle, Edit, Plus, Search, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";

interface FuelCard {
  id: string;
  cardNumber: string;
  assignedTo: string;
  fleetNumber?: string;
  issueDate: string;
  expiryDate: string;
  status: "active" | "suspended" | "lost" | "expired";
  monthlyLimit: number;
  currentUsage: number;
}

const FuelCardManager: React.FC = () => {
  const { isLoading } = useAppContext();
  const loading =
    typeof isLoading === "boolean" ? isLoading : !!(isLoading?.loadTrips || isLoading?.addTrip);

  // Handler for adding a new card
  const handleAddNewCard = () => {
    // In a real implementation, this would open a modal or navigate to a form
    console.log("Add new fuel card");
    // This would be replaced with actual implementation
  };

  // State for fuel cards
  const [fuelCards, setFuelCards] = useState<FuelCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<FuelCard[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data for demonstration
  useEffect(() => {
    // In a real implementation, this would fetch from Firestore
    const mockCards: FuelCard[] = [
      {
        id: "fc-001",
        cardNumber: "5432-XXXX-XXXX-1234",
        assignedTo: "John Smith",
        fleetNumber: "MT-1001",
        issueDate: "2024-01-15",
        expiryDate: "2026-01-31",
        status: "active",
        monthlyLimit: 2000,
        currentUsage: 1250,
      },
      {
        id: "fc-002",
        cardNumber: "5432-XXXX-XXXX-5678",
        assignedTo: "Jane Doe",
        fleetNumber: "MT-1002",
        issueDate: "2024-02-10",
        expiryDate: "2026-02-28",
        status: "active",
        monthlyLimit: 1500,
        currentUsage: 1300,
      },
      {
        id: "fc-003",
        cardNumber: "5432-XXXX-XXXX-9012",
        assignedTo: "Alex Johnson",
        fleetNumber: "MT-1003",
        issueDate: "2023-11-05",
        expiryDate: "2025-11-30",
        status: "suspended",
        monthlyLimit: 2000,
        currentUsage: 0,
      },
      {
        id: "fc-004",
        cardNumber: "5432-XXXX-XXXX-3456",
        assignedTo: "Michael Brown",
        fleetNumber: "MT-1004",
        issueDate: "2024-03-20",
        expiryDate: "2026-03-31",
        status: "lost",
        monthlyLimit: 1800,
        currentUsage: 450,
      },
    ];

    setFuelCards(mockCards);
    setFilteredCards(mockCards);
  }, []);

  // Filter cards when search term or status filter changes
  useEffect(() => {
    let filtered = [...fuelCards];

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(
        (card) =>
          card.cardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (card.fleetNumber && card.fleetNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((card) => card.status === statusFilter);
    }

    setFilteredCards(filtered);
  }, [searchTerm, statusFilter, fuelCards]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Active
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" /> Suspended
          </span>
        );
      case "lost":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" /> Lost/Stolen
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Fuel Card Management</h2>
        <div className="flex space-x-2">
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAddNewCard}
            disabled={loading}
          >
            {loading ? "Loading..." : "New Card"}
          </Button>
          <SyncIndicator />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by card number, name, or fleet number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="lost">Lost/Stolen</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Fuel Cards Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Card Number
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Assigned To
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fleet #
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Issue Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Expiry
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Limit
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Usage
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                      <div className="flex justify-center items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        <span>Loading fuel cards...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCards.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                      No fuel cards found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredCards.map((card) => (
                    <tr key={card.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {card.cardNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {card.assignedTo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {card.fleetNumber || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getStatusBadge(card.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(card.issueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(card.expiryDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${card.monthlyLimit.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="mr-2">${card.currentUsage.toFixed(2)}</div>
                          <div className="w-24 bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${
                                card.currentUsage / card.monthlyLimit > 0.9
                                  ? "bg-red-500"
                                  : card.currentUsage / card.monthlyLimit > 0.75
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.min(100, (card.currentUsage / card.monthlyLimit) * 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900" onClick={() => {}}>
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900" onClick={() => {}}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FuelCardManager;
