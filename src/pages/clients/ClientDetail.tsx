import { Button } from "../../components/ui/Button";
import {
  BarChart,
  Building,
  Calendar,
  Clock,
  CreditCard,
  Edit,
  FileText,
  Globe,
  Link,
  Mail,
  MapPin,
  Phone,
  Tag,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Badge } from "../../components/ui/badge";
import { useAppContext } from "../../context/AppContext";
import { Client, CLIENT_STATUSES, CLIENT_TYPES } from "../../types/client";
import { formatCurrency, formatDate } from "../../utils/helpers";

interface ClientDetailProps {
  client: Client;
  onEdit: () => void;
  onManageRelationships: () => void;
}

const ClientDetail: React.FC<ClientDetailProps> = ({ client, onEdit, onManageRelationships }) => {
  const { trips } = useAppContext();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Get client status label
  const getStatusLabel = (status: string) => {
    return CLIENT_STATUSES.find((s) => s.value === status)?.label || status;
  };

  // Get client type label
  const getTypeLabel = (type: string) => {
    return CLIENT_TYPES.find((t) => t.value === type)?.label || type;
  };

  // Get status badge class
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

  // Calculate client metrics
  const calculateClientMetrics = () => {
    // Filter trips for this client
    const clientTrips = trips.filter((trip) => trip.clientName === client.name);

    // Calculate revenue
    const totalRevenue = clientTrips.reduce((sum, trip) => sum + trip.baseRevenue, 0);

    // Calculate trip counts by status
    const activeTrips = clientTrips.filter((trip) => trip.status === "active").length;
    const completedTrips = clientTrips.filter(
      (trip) => trip.status === "completed" || trip.status === "invoiced" || trip.status === "paid"
    ).length;

    // Calculate invoiced amount and paid amount
    const invoicedAmount = clientTrips
      .filter((trip) => trip.status === "invoiced" || trip.status === "paid")
      .reduce((sum, trip) => sum + trip.baseRevenue, 0);

    const paidAmount = clientTrips
      .filter((trip) => trip.status === "paid")
      .reduce((sum, trip) => sum + trip.baseRevenue, 0);

    // Calculate outstanding amount
    const outstandingAmount = invoicedAmount - paidAmount;

    // Calculate last trip date
    const sortedTrips = [...clientTrips].sort(
      (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
    );

    const lastTripDate = sortedTrips.length > 0 ? sortedTrips[0]?.endDate : null;

    return {
      totalRevenue,
      activeTrips,
      completedTrips,
      totalTrips: clientTrips.length,
      invoicedAmount,
      paidAmount,
      outstandingAmount,
      lastTripDate,
    };
  };

  const metrics = calculateClientMetrics();

  // Handle client deletion
  const handleDelete = () => {
    // Here you would implement the actual deletion logic
    // For example, calling an API or dispatching an action
    console.log(`Deleting client: ${client.id}`);

    // Close the modal after deletion
    setShowConfirmDelete(false);

    // You might want to redirect the user after deletion
    // or show a success message
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete client "{client.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowConfirmDelete(false)}>
                Cancel
              </Button>
              <Button color="danger" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Client Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between">
            <div className="flex items-start">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <h2 className="text-xl font-bold text-gray-900">{client.name}</h2>
                  <Badge className={`ml-3 ${getStatusClass(client.status)}`}>
                    {getStatusLabel(client.status)}
                  </Badge>
                  <Badge
                    className={`ml-2 ${client.type === "internal" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}
                  >
                    {getTypeLabel(client.type)}
                  </Badge>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  Client since {formatDate(client.createdAt)}
                  {client.industry && ` • ${client.industry}`}
                </div>
                {client.tags && client.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {client.tags.map((tag, index) => (
                      <Badge key={index} className="bg-gray-100 text-gray-800 flex items-center">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                icon={<Link className="w-4 h-4" />}
                onClick={onManageRelationships}
              >
                Manage Relationships
              </Button>
              <Button variant="outline" icon={<Edit className="w-4 h-4" />} onClick={onEdit}>
                Edit Client
              </Button>
              <Button variant="outline" color="danger" onClick={() => setShowConfirmDelete(true)}>
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metrics.totalRevenue, client.currency)}
                </p>
                <p className="text-xs text-gray-500">Lifetime value</p>
              </div>
              <BarChart className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Outstanding</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(metrics.outstandingAmount, client.currency)}
                </p>
                <p className="text-xs text-gray-500">Unpaid invoices</p>
              </div>
              <CreditCard className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalTrips}</p>
                <p className="text-xs text-gray-500">
                  {metrics.activeTrips} active • {metrics.completedTrips} completed
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Last Trip</p>
                <p className="text-xl font-bold text-gray-900">
                  {metrics.lastTripDate ? formatDate(metrics.lastTripDate) : "No trips"}
                </p>
                <p className="text-xs text-gray-500">Most recent activity</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader title="Contact Information" />
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Contact Person</p>
                <p className="font-medium">{client.contactPerson}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                    {client.email}
                  </a>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Phone</p>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline">
                    {client.phone}
                  </a>
                </div>
              </div>

              {client.website && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Website</p>
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-gray-400" />
                    <a
                      href={
                        client.website.startsWith("http")
                          ? client.website
                          : `https://${client.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {client.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader title="Address Information" />
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Business Address</p>
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-1" />
                  <div>
                    <p>{client.address.street}</p>
                    <p>
                      {client.address.city}, {client.address.state} {client.address.postalCode}
                    </p>
                    <p>{client.address.country}</p>
                  </div>
                </div>
              </div>

              {client.billingAddress && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Billing Address</p>
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-1" />
                    <div>
                      <p>{client.billingAddress.street}</p>
                      <p>
                        {client.billingAddress.city}, {client.billingAddress.state}{" "}
                        {client.billingAddress.postalCode}
                      </p>
                      <p>{client.billingAddress.country}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader title="Financial Information" />
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <p className="text-sm text-gray-500">Currency</p>
                <p className="font-medium">{client.currency}</p>
              </div>

              {client.vatNumber && (
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">VAT Number</p>
                  <p className="font-medium">{client.vatNumber}</p>
                </div>
              )}

              {client.registrationNumber && (
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Registration Number</p>
                  <p className="font-medium">{client.registrationNumber}</p>
                </div>
              )}

              {client.paymentTerms !== undefined && (
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Payment Terms</p>
                  <p className="font-medium">{client.paymentTerms} days</p>
                </div>
              )}

              {client.creditLimit !== undefined && (
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Credit Limit</p>
                  <p className="font-medium">
                    {formatCurrency(client.creditLimit, client.currency)}
                  </p>
                </div>
              )}

              <div className="flex justify-between pt-2 border-t">
                <p className="text-sm font-medium">Outstanding Amount</p>
                <p className="font-medium text-red-600">
                  {formatCurrency(metrics.outstandingAmount, client.currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes and Relationships */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notes */}
        <Card>
          <CardHeader
            title="Notes"
            action={
              <Button
                size="sm"
                variant="outline"
                icon={<Edit className="w-4 h-4" />}
                onClick={onEdit}
              >
                Edit
              </Button>
            }
          />
          <CardContent>
            {client.notes ? (
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-line">{client.notes}</p>
              </div>
            ) : (
              <div className="text-center py-6">
                <FileText className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No notes available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Relationships */}
        <Card>
          <CardHeader
            title="Relationships"
            action={
              <Button
                size="sm"
                variant="outline"
                icon={<Link className="w-4 h-4" />}
                onClick={onManageRelationships}
              >
                Manage
              </Button>
            }
          />
          <CardContent>
            {client.relationships.length > 0 ? (
              <div className="space-y-3">
                {client.relationships.map((relationship) => {
                  const relatedClient = {
                    name: "Unknown Client",
                    type: "external",
                    status: "active",
                  };

                  // Get the relationship type label
                  const getRelationshipTypeLabel = (type: string) => {
                    switch (type) {
                      case "parent":
                        return "Parent Company";
                      case "subsidiary":
                        return "Subsidiary";
                      case "partner":
                        return "Business Partner";
                      case "competitor":
                        return "Competitor";
                      default:
                        return type;
                    }
                  };

                  return (
                    <div
                      key={relationship.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <Building className="w-5 h-5 text-gray-400" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{relatedClient.name}</p>
                          <p className="text-xs text-gray-500">
                            {getRelationshipTypeLabel(relationship.relationType)}
                            {relationship.notes ? ` • ${relationship.notes}` : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No relationships defined</p>
                <div className="mt-4">
                  <Button
                    size="sm"
                    onClick={onManageRelationships}
                    icon={<Link className="w-4 h-4" />}
                  >
                    Add Relationship
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDetail;
