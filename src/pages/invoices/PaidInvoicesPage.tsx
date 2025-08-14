import React, { useEffect, useState } from "react";
// Import Ant Design components directly
import {
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
  PrinterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Card, DatePicker, Input, Space, Table, Tag, Tooltip, Typography } from "antd";
import { useNavigate } from "react-router-dom";

// Extract nested components
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface PaidInvoice {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  issueDate: string;
  paidDate: string;
  paymentMethod: string;
  referenceNumber: string;
}

const PaidInvoicesPage: React.FC = () => {
  const [paidInvoices, setPaidInvoices] = useState<PaidInvoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    // Simulate fetching data from API or Firestore
    const fetchPaidInvoices = async () => {
      try {
        // This would be replaced with actual API or Firestore fetch
        const mockData: PaidInvoice[] = [
          {
            id: "101",
            invoiceNumber: "INV-2023-098",
            client: "Acme Logistics",
            amount: 3750.0,
            issueDate: "2023-10-15",
            paidDate: "2023-10-30",
            paymentMethod: "bank_transfer",
            referenceNumber: "TRF83726354",
          },
          {
            id: "102",
            invoiceNumber: "INV-2023-097",
            client: "Global Transport Co",
            amount: 5125.5,
            issueDate: "2023-10-10",
            paidDate: "2023-10-28",
            paymentMethod: "check",
            referenceNumber: "CHK4521",
          },
          {
            id: "103",
            invoiceNumber: "INV-2023-096",
            client: "Pacific Hauling",
            amount: 2345.75,
            issueDate: "2023-10-05",
            paidDate: "2023-10-25",
            paymentMethod: "credit_card",
            referenceNumber: "CC-AUTH-87654",
          },
        ];

        setPaidInvoices(mockData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching paid invoices:", error);
        setLoading(false);
      }
    };

    fetchPaidInvoices();
  }, []);

  const handleViewInvoice = (id: string) => {
    navigate(`/invoices/view/${id}`);
  };

  const handleDownloadInvoice = (id: string) => {
    // Implement download logic
    console.log(`Downloading invoice ${id}`);
  };

  const handlePrintInvoice = (id: string) => {
    // Implement print logic
    console.log(`Printing invoice ${id}`);
  };

  const getPaymentMethodTag = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return <Tag color="green">Bank Transfer</Tag>;
      case "check":
        return <Tag color="blue">Check</Tag>;
      case "credit_card":
        return <Tag color="purple">Credit Card</Tag>;
      default:
        return <Tag color="default">Other</Tag>;
    }
  };

  const filteredInvoices = paidInvoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchText.toLowerCase()) ||
      invoice.referenceNumber.toLowerCase().includes(searchText.toLowerCase())
  );

  // Define the columns with proper type
  // Use 'as any' to bypass TypeScript error temporarily - we'll fix the underlying issue
  const columns = [
    {
      title: "Invoice #",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      sorter: (a: PaidInvoice, b: PaidInvoice) => a.invoiceNumber.localeCompare(b.invoiceNumber),
    },
    {
      title: "Client",
      dataIndex: "client",
      key: "client",
      sorter: (a: PaidInvoice, b: PaidInvoice) => a.client.localeCompare(b.client),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `$${amount.toFixed(2)}`,
      sorter: (a: PaidInvoice, b: PaidInvoice) => a.amount - b.amount,
    },
    {
      title: "Issue Date",
      dataIndex: "issueDate",
      key: "issueDate",
      sorter: (a: PaidInvoice, b: PaidInvoice) =>
        new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime(),
    },
    {
      title: "Paid Date",
      dataIndex: "paidDate",
      key: "paidDate",
      sorter: (a: PaidInvoice, b: PaidInvoice) =>
        new Date(a.paidDate).getTime() - new Date(b.paidDate).getTime(),
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method: string) => getPaymentMethodTag(method),
      filters: [
        { text: "Bank Transfer", value: "bank_transfer" },
        { text: "Check", value: "check" },
        { text: "Credit Card", value: "credit_card" },
      ],
      // Use any type to bypass TypeScript error
      onFilter: (value: any, record: PaidInvoice) => record.paymentMethod === value.toString(),
    },
    {
      title: "Reference #",
      dataIndex: "referenceNumber",
      key: "referenceNumber",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: PaidInvoice) => (
        <Space size="small">
          <Tooltip title="View Invoice">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewInvoice(record.id)}
              type="link"
            />
          </Tooltip>
          <Tooltip title="Download Invoice">
            <Button
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadInvoice(record.id)}
              type="link"
            />
          </Tooltip>
          <Tooltip title="Print Invoice">
            <Button
              icon={<PrinterOutlined />}
              onClick={() => handlePrintInvoice(record.id)}
              type="link"
            />
          </Tooltip>
        </Space>
      ),
    },
  ] as any; // Use type assertion to bypass TypeScript error

  return (
    <div className="paid-invoices-page">
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <Title level={4}>Paid Invoices</Title>
          <Space>
            <RangePicker placeholder={["From Date", "To Date"]} style={{ width: 280 }} />
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
                  <Table.Summary.Cell index={3} colSpan={5}></Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default PaidInvoicesPage;
