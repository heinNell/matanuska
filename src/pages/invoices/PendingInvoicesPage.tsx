import {
  CheckOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Card, Input, Space, Table, Tag, Tooltip } from "antd";
// Import Typography components directly
import { Typography as AntTypography } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const { Title, Text } = AntTypography;

interface PendingInvoice {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: string;
  daysPending: number;
}

const PendingInvoicesPage: React.FC = () => {
  const [pendingInvoices, setPendingInvoices] = useState<PendingInvoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    // Simulate fetching data from API or Firestore
    const fetchPendingInvoices = async () => {
      try {
        // This would be replaced with actual API or Firestore fetch
        const mockData: PendingInvoice[] = [
          {
            id: "1",
            invoiceNumber: "INV-2023-001",
            client: "Acme Logistics",
            amount: 4500.0,
            issueDate: "2023-11-01",
            dueDate: "2023-12-01",
            status: "awaiting_approval",
            daysPending: 12,
          },
          {
            id: "2",
            invoiceNumber: "INV-2023-002",
            client: "Global Transport Co",
            amount: 2750.5,
            issueDate: "2023-11-05",
            dueDate: "2023-12-05",
            status: "awaiting_payment",
            daysPending: 8,
          },
          {
            id: "3",
            invoiceNumber: "INV-2023-003",
            client: "Pacific Hauling",
            amount: 8920.75,
            issueDate: "2023-11-10",
            dueDate: "2023-12-10",
            status: "awaiting_approval",
            daysPending: 3,
          },
        ];

        setPendingInvoices(mockData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching pending invoices:", error);
        setLoading(false);
      }
    };

    fetchPendingInvoices();
  }, []);

  const handleViewInvoice = (id: string) => {
    navigate(`/invoices/view/${id}`);
  };

  const handleApproveInvoice = (id: string) => {
    // Implement approve logic
    console.log(`Approving invoice ${id}`);
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case "awaiting_approval":
        return (
          <Tag color="orange">
            <ClockCircleOutlined /> Awaiting Approval
          </Tag>
        );
      case "awaiting_payment":
        return (
          <Tag color="blue">
            <CheckOutlined /> Approved, Awaiting Payment
          </Tag>
        );
      default:
        return <Tag color="default">Unknown Status</Tag>;
    }
  };

  const filteredInvoices = pendingInvoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchText.toLowerCase())
  );

  // Define the columns with proper type
  // Use 'as any' to bypass TypeScript error temporarily
  const columns = [
    {
      title: "Invoice #",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      sorter: (a: PendingInvoice, b: PendingInvoice) =>
        a.invoiceNumber.localeCompare(b.invoiceNumber),
    },
    {
      title: "Client",
      dataIndex: "client",
      key: "client",
      sorter: (a: PendingInvoice, b: PendingInvoice) => a.client.localeCompare(b.client),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `$${amount.toFixed(2)}`,
      sorter: (a: PendingInvoice, b: PendingInvoice) => a.amount - b.amount,
    },
    {
      title: "Issue Date",
      dataIndex: "issueDate",
      key: "issueDate",
      sorter: (a: PendingInvoice, b: PendingInvoice) =>
        new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime(),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      sorter: (a: PendingInvoice, b: PendingInvoice) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: "Awaiting Approval", value: "awaiting_approval" },
        { text: "Awaiting Payment", value: "awaiting_payment" },
      ],
      onFilter: (value: string, record: PendingInvoice) => record.status === value,
    },
    {
      title: "Days Pending",
      dataIndex: "daysPending",
      key: "daysPending",
      sorter: (a: PendingInvoice, b: PendingInvoice) => a.daysPending - b.daysPending,
    },
    {
      title: "Actions",
      key: "actions",
      render: (text: string, record: PendingInvoice) => (
        <Space size="small">
          <Tooltip title="View Invoice">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewInvoice(record.id)}
              type="link"
            />
          </Tooltip>
          {record.status === "awaiting_approval" && (
            <Tooltip title="Approve Invoice">
              <Button
                icon={<CheckOutlined />}
                onClick={() => handleApproveInvoice(record.id)}
                type="link"
                style={{ color: "green" }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ] as any; // Use type assertion to bypass TypeScript error

  return (
    <div className="pending-invoices-page">
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <Title level={4}>Pending Invoices</Title>
          <Space>
            <Input
              placeholder="Search invoices..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            <Tooltip title="Filter Options">
              <Button icon={<FilterOutlined />} />
            </Tooltip>
          </Space>
        </div>

        <Table
          dataSource={filteredInvoices}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          summary={(pageData) => {
            const totalAmount = pageData.reduce((total, invoice) => total + invoice.amount, 0);

            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <Text strong>Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <Text strong>${totalAmount.toFixed(2)}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} colSpan={4}></Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default PendingInvoicesPage;
