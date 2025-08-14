import { Button } from "@/components/ui/Button";
import Card, { CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  Building,
  Filter,
  Mail,
  MapPin,
  Phone,
  Tag,
  UserPlus,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { Client, CLIENT_STATUSES, CLIENT_TYPES } from "../../types/client";
import { formatDate } from "../../utils/helpers";

interface ActiveCustomersProps {
  clients?: Client[];
  searchTerm?: string;
  onSelectClient?: (clientId: string) => void;
  onAddClient?: () => void;
}

const ActiveCustomers: React.FC<ActiveCustomersProps> = ({
  clients,
  searchTerm,
  onSelectClient,
  onAddClient,
}) => {
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    currency: "",
  });

  const [sortField, setSortField] = useState<keyof Client>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filter and sort clients
  const filteredClients = (clients || []).filter((client) => {
    const matchesSearch = searchTerm
      ? client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;

    const matchesType = filters.type ? client.type === filters.type : true;
    const matchesStatus = filters.status ? client.status === filters.status : true;
    const matchesCurrency = filters.currency ? client.currency === filters.currency : true;

    return matchesSearch && matchesType && matchesStatus && matchesCurrency;
  });

  // Apply sorting
  const sortedClients = [...filteredClients].sort((a, b) => {
    let valueA = a[sortField];
    let valueB = b[sortField];

    // Handle nested fields or fields that might be undefined
    if (valueA === undefined) valueA = "";
    if (valueB === undefined) valueB = "";

    // Convert to strings for comparison
    const strA = String(valueA).toLowerCase();
    const strB = String(valueB).toLowerCase();

    if (sortDirection === "asc") {
      return strA.localeCompare(strB);
    } else {
      return strB.localeCompare(strA);
    }
  });

  // Handle sort toggle
  const toggleSort = (field: keyof Client) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle filter change
  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      type: "",
      status: "",
      currency: "",
    });
  };

  // Get status class for badge
  const getStatusClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Get currency symbol
  const getCurrencySymbol = (currency: "ZAR" | "USD") => {
    return currency === "USD" ? "$" : "R";
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center">
              <Filter className="w-5 h-5 mr-2 text-gray-500" />
              <span>Filter Clients</span>
            </div>
          }
          action={
            <Button size="sm" variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          }
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Type</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              >
                <option value="">All Types</option>
                {CLIENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">All Statuses</option>
                {CLIENT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={filters.currency}
                onChange={(e) => handleFilterChange("currency", e.target.value)}
              >
                <option value="">All Currencies</option>
                <option value="ZAR">South African Rand (ZAR)</option>
                <option value="USD">US Dollar (USD)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client List */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              <span>Clients ({filteredClients.length})</span>
            </div>
          }
          action={
            <Button size="sm" icon={<UserPlus className="w-4 h-4" />} onClick={onAddClient}>
              Add Client
            </Button>
          }
        />
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
              <p className="mt-1 text-gray-500">
                {searchTerm || filters.type || filters.status || filters.currency
                  ? "No clients match your search criteria."
                  : "Get started by adding your first client."}
              </p>
              <div className="mt-6">
                <Button onClick={onAddClient} icon={<UserPlus className="w-4 h-4" />}>
                  Add New Client
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => toggleSort("name")}
                    >
                      <div className="flex items-center">
                        <span>Client Name</span>
                        {sortField === "name" && <ArrowUpDown className="w-4 h-4 ml-1" />}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Contact
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Location
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Currency
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => toggleSort("createdAt")}
                    >
                      <div className="flex items-center">
                        <span>Created</span>
                        {sortField === "createdAt" && <ArrowUpDown className="w-4 h-4 ml-1" />}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedClients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => onSelectClient && onSelectClient(client.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building className="flex-shrink-0 h-5 w-5 text-gray-400" />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{client.name}</div>
                            {client.industry && (
                              <div className="text-sm text-gray-500">{client.industry}</div>
                            )}
                            {client.tags && client.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {client.tags.slice(0, 2).map((tag, index) => (
                                  <Badge key={index} className="bg-blue-50 text-blue-700">
                                    <Tag className="w-3 h-3 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                                {client.tags.length > 2 && (
                                  <Badge className="bg-gray-50 text-gray-600">
                                    +{client.tags.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{client.contactPerson}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {client.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {client.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {client.address.city}, {client.address.country}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge
                          className={
                            client.type === "internal"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }
                        >
                          {client.type === "internal" ? "Internal" : "External"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge className={getStatusClass(client.status)}>
                          {CLIENT_STATUSES.find((s) => s.value === client.status)?.label ||
                            client.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge className="bg-gray-100 text-gray-800">
                          {getCurrencySymbol(client.currency)} {client.currency}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(client.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActiveCustomers;
