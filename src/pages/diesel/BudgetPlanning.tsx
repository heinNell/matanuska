import React, { useState } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Table,
  Button,
  Space,
  Statistic,
  Progress,
  Input,
  Form,
  InputNumber,
  Select,
  Modal,
  message,
  Alert,
  Divider,
} from "antd";
import {
  DollarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

interface BudgetItem {
  id: string;
  category: string;
  budgetAmount: number;
  spentAmount: number;
  period: string;
  startDate: string;
  endDate: string;
  status: "on_track" | "warning" | "exceeded";
}

const BudgetPlanning: React.FC = () => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    {
      id: "1",
      category: "Monthly Fuel",
      budgetAmount: 25000,
      spentAmount: 18460,
      period: "monthly",
      startDate: "2023-11-01",
      endDate: "2023-11-30",
      status: "on_track",
    },
    {
      id: "2",
      category: "Quarterly Maintenance",
      budgetAmount: 15000,
      spentAmount: 12800,
      period: "quarterly",
      startDate: "2023-10-01",
      endDate: "2023-12-31",
      status: "warning",
    },
    {
      id: "3",
      category: "Annual Equipment",
      budgetAmount: 50000,
      spentAmount: 52500,
      period: "yearly",
      startDate: "2023-01-01",
      endDate: "2023-12-31",
      status: "exceeded",
    },
    {
      id: "4",
      category: "Emergency Fund",
      budgetAmount: 10000,
      spentAmount: 2400,
      period: "monthly",
      startDate: "2023-11-01",
      endDate: "2023-11-30",
      status: "on_track",
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [form] = Form.useForm();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on_track":
        return "#3f8600";
      case "warning":
        return "#faad14";
      case "exceeded":
        return "#cf1322";
      default:
        return "#1890ff";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "on_track":
        return "On Track";
      case "warning":
        return "Warning";
      case "exceeded":
        return "Exceeded";
      default:
        return status;
    }
  };

  const calculateUtilization = (spent: number, budget: number) => {
    return Math.round((spent / budget) * 100);
  };

  const getProgressStatus = (
    spent: number,
    budget: number
  ): "success" | "normal" | "exception" | "active" | undefined => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return "exception";
    if (percentage >= 85) return "normal"; // Changed from 'warning' as it's not a valid status
    if (percentage >= 70) return "normal";
    return "success";
  };

  const handleAddEdit = (values: any) => {
    const newItem: BudgetItem = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      ...values,
      spentAmount: editingItem ? editingItem.spentAmount : 0,
      status: "on_track",
    };

    if (editingItem) {
      setBudgetItems((prev) => prev.map((item) => (item.id === editingItem.id ? newItem : item)));
      message.success("Budget item updated successfully");
    } else {
      setBudgetItems((prev) => [...prev, newItem]);
      message.success("Budget item added successfully");
    }

    setIsModalVisible(false);
    setEditingItem(null);
    form.resetFields();
  };

  const handleEdit = (item: BudgetItem) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setBudgetItems((prev) => prev.filter((item) => item.id !== id));
    message.success("Budget item deleted successfully");
  };

  const columns = [
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      sorter: (a: BudgetItem, b: BudgetItem) => a.category.localeCompare(b.category),
    },
    {
      title: "Budget",
      dataIndex: "budgetAmount",
      key: "budgetAmount",
      render: (text: number) => `$${text.toLocaleString()}`,
      sorter: (a: BudgetItem, b: BudgetItem) => a.budgetAmount - b.budgetAmount,
    },
    {
      title: "Spent",
      dataIndex: "spentAmount",
      key: "spentAmount",
      render: (text: number) => `$${text.toLocaleString()}`,
      sorter: (a: BudgetItem, b: BudgetItem) => a.spentAmount - b.spentAmount,
    },
    {
      title: "Utilization",
      key: "utilization",
      render: (_: any, record: BudgetItem) => (
        <Progress
          percent={calculateUtilization(record.spentAmount, record.budgetAmount)}
          status={getProgressStatus(record.spentAmount, record.budgetAmount)}
          size="small"
        />
      ),
      sorter: (a: BudgetItem, b: BudgetItem) =>
        calculateUtilization(a.spentAmount, a.budgetAmount) -
        calculateUtilization(b.spentAmount, b.budgetAmount),
    },
    {
      title: "Period",
      dataIndex: "period",
      key: "period",
      render: (text: string) => text.charAt(0).toUpperCase() + text.slice(1),
      filters: [
        { text: "Monthly", value: "monthly" },
        { text: "Quarterly", value: "quarterly" },
        { text: "Yearly", value: "yearly" },
      ],
      onFilter: (value: boolean | React.Key, record: BudgetItem) => record.period === value,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text: string) => (
        <Text style={{ color: getStatusColor(text) }}>{getStatusText(text)}</Text>
      ),
      filters: [
        { text: "On Track", value: "on_track" },
        { text: "Warning", value: "warning" },
        { text: "Exceeded", value: "exceeded" },
      ],
      onFilter: (value: boolean | React.Key, record: BudgetItem) => record.status === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: BudgetItem) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="link"
            size="small"
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            type="link"
            danger
            size="small"
          />
        </Space>
      ),
    },
  ];

  // Calculate summary statistics
  const totalBudget = budgetItems.reduce((sum, item) => sum + item.budgetAmount, 0);
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spentAmount, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overBudgetItems = budgetItems.filter((item) => item.status === "exceeded").length;

  return (
    <div className="budget-planning-page">
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <Title level={3}>
              <DollarOutlined style={{ marginRight: "8px" }} />
              Budget Planning
            </Title>
            <Text type="secondary">
              Plan and monitor your fleet's budget allocation and spending
            </Text>
          </div>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
              Add Budget Item
            </Button>
          </Space>
        </div>

        {overBudgetItems > 0 && (
          <Alert
            message="Budget Alert"
            description={`${overBudgetItems} budget categories have exceeded their allocated amounts. Please review and take corrective action.`}
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            style={{ marginBottom: "24px" }}
          />
        )}

        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Budget"
                value={totalBudget}
                prefix="$"
                precision={0}
                valueStyle={{ color: "#1890ff" }}
              />
              <Text type="secondary">Allocated amount</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Spent"
                value={totalSpent}
                prefix="$"
                precision={0}
                valueStyle={{ color: "#cf1322" }}
              />
              <Text type="secondary">Used so far</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Remaining"
                value={totalRemaining}
                prefix="$"
                precision={0}
                valueStyle={{ color: totalRemaining >= 0 ? "#3f8600" : "#cf1322" }}
              />
              <Text type="secondary">Available budget</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Utilization"
                value={Math.round((totalSpent / totalBudget) * 100)}
                suffix="%"
                valueStyle={{
                  color: totalSpent > totalBudget ? "#cf1322" : "#3f8600",
                }}
              />
              <Text type="secondary">Overall usage</Text>
            </Card>
          </Col>
        </Row>

        <Divider orientation="left">Budget Categories</Divider>

        <Table
          dataSource={budgetItems}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

        <Card title="Budget Insights" style={{ marginTop: "24px" }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="Monthly Forecast" type="inner">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text>Projected monthly spend:</Text>
                    <Text strong>$22,500</Text>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text>Current burn rate:</Text>
                    <Text strong>$750/day</Text>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text>Days remaining in budget:</Text>
                    <Text strong style={{ color: "#3f8600" }}>
                      33 days
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Recommendations" type="inner">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <CheckCircleOutlined style={{ color: "#3f8600", marginRight: "8px" }} />
                    <Text>Fuel spending is on track</Text>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <WarningOutlined style={{ color: "#faad14", marginRight: "8px" }} />
                    <Text>Review maintenance budget allocation</Text>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <WarningOutlined style={{ color: "#cf1322", marginRight: "8px" }} />
                    <Text>Equipment budget exceeded - reallocate funds</Text>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </Card>

        <Modal
          title={editingItem ? "Edit Budget Item" : "Add Budget Item"}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingItem(null);
            form.resetFields();
          }}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleAddEdit}>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: "Please enter a category" }]}
            >
              <Input placeholder="e.g., Monthly Fuel, Maintenance, etc." />
            </Form.Item>

            <Form.Item
              name="budgetAmount"
              label="Budget Amount ($)"
              rules={[{ required: true, message: "Please enter the budget amount" }]}
            >
              <InputNumber style={{ width: "100%" }} min={0} precision={2} placeholder="0.00" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="period"
                  label="Period"
                  rules={[{ required: true, message: "Please select a period" }]}
                >
                  <Select placeholder="Select period">
                    <Option value="monthly">Monthly</Option>
                    <Option value="quarterly">Quarterly</Option>
                    <Option value="yearly">Yearly</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="startDate"
                  label="Start Date"
                  rules={[{ required: true, message: "Please enter start date" }]}
                >
                  <Input type="date" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="endDate"
              label="End Date"
              rules={[{ required: true, message: "Please enter end date" }]}
            >
              <Input type="date" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingItem ? "Update" : "Add"} Budget Item
                </Button>
                <Button
                  onClick={() => {
                    setIsModalVisible(false);
                    setEditingItem(null);
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default BudgetPlanning;
