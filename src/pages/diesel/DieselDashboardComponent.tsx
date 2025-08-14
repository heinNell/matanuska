import React from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Progress,
  Space,
  Table,
  Tag,
  Button,
  Divider,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  CarOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  LineChartOutlined,
  BarChartOutlined,
  UserOutlined,
  AlertOutlined,
  EyeOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// Mock data is defined but will be used in future chart implementations
// We're keeping these variables commented out for reference
/*
const mockConsumptionData = [
  { month: 'Jan', consumption: 12500 },
  { month: 'Feb', consumption: 13200 },
  { month: 'Mar', consumption: 12800 },
  { month: 'Apr', consumption: 13500 },
  { month: 'May', consumption: 14200 },
  { month: 'Jun', consumption: 13800 }
];

const mockCostData = [
  { month: 'Jan', cost: 15625 },
  { month: 'Feb', cost: 17160 },
  { month: 'Mar', cost: 16640 },
  { month: 'Apr', cost: 17820 },
  { month: 'May', cost: 18460 },
  { month: 'Jun', cost: 17940 }
];
*/

const recentFuelTransactions = [
  {
    key: "1",
    date: "2023-11-20",
    vehicle: "Truck 101",
    driver: "John Doe",
    amount: 125.5,
    cost: 156.88,
    location: "Shell Station, Highway 95",
  },
  {
    key: "2",
    date: "2023-11-19",
    vehicle: "Truck 103",
    driver: "Mike Johnson",
    amount: 145.2,
    cost: 181.5,
    location: "Chevron, Main St.",
  },
  {
    key: "3",
    date: "2023-11-18",
    vehicle: "Truck 102",
    driver: "Jane Smith",
    amount: 110.8,
    cost: 138.5,
    location: "BP Station, Route 66",
  },
  {
    key: "4",
    date: "2023-11-17",
    vehicle: "Truck 104",
    driver: "Sarah Williams",
    amount: 135.3,
    cost: 169.13,
    location: "Exxon, Interstate 80",
  },
];

// Mock alerts data
const fuelAlerts = [
  {
    key: "1",
    type: "high_consumption",
    vehicle: "Truck 102",
    message: "25% higher consumption than average",
    date: "2023-11-19",
  },
  {
    key: "2",
    type: "price_anomaly",
    vehicle: "Truck 103",
    message: "Unusual price per liter ($1.45)",
    date: "2023-11-18",
  },
  {
    key: "3",
    type: "suspicious_transaction",
    vehicle: "Truck 101",
    message: "Multiple fills within 3 hours",
    date: "2023-11-17",
  },
];

const columns = [
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Vehicle",
    dataIndex: "vehicle",
    key: "vehicle",
  },
  {
    title: "Driver",
    dataIndex: "driver",
    key: "driver",
  },
  {
    title: "Amount (L)",
    dataIndex: "amount",
    key: "amount",
    render: (text: number) => `${text.toFixed(1)}L`,
  },
  {
    title: "Cost ($)",
    dataIndex: "cost",
    key: "cost",
    render: (text: number) => `$${text.toFixed(2)}`,
  },
  {
    title: "Location",
    dataIndex: "location",
    key: "location",
  },
  {
    title: "Action",
    key: "action",
    render: () => (
      <Button type="link" icon={<EyeOutlined />} size="small">
        View
      </Button>
    ),
  },
];

const alertColumns = [
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
    render: (text: string) => {
      let color = "";
      let display = "";
      let icon = null;

      switch (text) {
        case "high_consumption":
          color = "orange";
          display = "High Consumption";
          icon = <ArrowUpOutlined />;
          break;
        case "price_anomaly":
          color = "blue";
          display = "Price Anomaly";
          icon = <DollarOutlined />;
          break;
        case "suspicious_transaction":
          color = "red";
          display = "Suspicious Activity";
          icon = <AlertOutlined />;
          break;
        default:
          color = "default";
          display = text;
      }

      return (
        <Tag color={color} icon={icon}>
          {display}
        </Tag>
      );
    },
  },
  {
    title: "Vehicle",
    dataIndex: "vehicle",
    key: "vehicle",
  },
  {
    title: "Alert Message",
    dataIndex: "message",
    key: "message",
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Action",
    key: "action",
    render: () => (
      <Button type="link" icon={<EyeOutlined />} size="small">
        Investigate
      </Button>
    ),
  },
];

const DieselDashboardComponent: React.FC = () => {
  // These would come from context or API in a real app
  const dieselStats = {
    totalConsumption: 14200,
    consumptionChange: 5.2,
    avgConsumption: 33.5,
    totalCost: 18460,
    costChange: 3.5,
    avgCost: 1.3,
    budget: 25000,
    budgetUsed: 18460,
    carbonFootprint: 36.8,
    footprintChange: -2.1,
    avgEfficiency: 8.5,
    efficiencyChange: 0.3,
  };

  return (
    <div className="diesel-dashboard">
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Title level={3}>Diesel Management Dashboard</Title>
          <Text type="secondary">
            Overview of your fleet's fuel consumption, costs, and efficiency metrics
          </Text>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Consumption"
              value={dieselStats.totalConsumption}
              precision={0}
              valueStyle={{ color: dieselStats.consumptionChange > 0 ? "#cf1322" : "#3f8600" }}
              prefix={<CarOutlined />}
              suffix="L"
            />
            <div className="stat-footer">
              <Text type={dieselStats.consumptionChange > 0 ? "danger" : "success"}>
                {dieselStats.consumptionChange > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {Math.abs(dieselStats.consumptionChange)}% from last month
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Cost"
              value={dieselStats.totalCost}
              precision={0}
              valueStyle={{ color: dieselStats.costChange > 0 ? "#cf1322" : "#3f8600" }}
              prefix={<DollarOutlined />}
              suffix="$"
            />
            <div className="stat-footer">
              <Text type={dieselStats.costChange > 0 ? "danger" : "success"}>
                {dieselStats.costChange > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {Math.abs(dieselStats.costChange)}% from last month
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Avg. Cost Per Liter"
              value={dieselStats.avgCost}
              precision={2}
              valueStyle={{ color: "#1890ff" }}
              prefix="$"
            />
            <div className="stat-footer">
              <Space>
                <LineChartOutlined />
                <Text>Current market: $1.28/L</Text>
              </Space>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Carbon Footprint"
              value={dieselStats.carbonFootprint}
              precision={1}
              valueStyle={{
                color: dieselStats.footprintChange < 0 ? "#3f8600" : "#cf1322",
              }}
              prefix={<EnvironmentOutlined />}
              suffix="t CO2e"
            />
            <div className="stat-footer">
              <Text type={dieselStats.footprintChange < 0 ? "success" : "danger"}>
                {dieselStats.footprintChange < 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                {Math.abs(dieselStats.footprintChange)}% from last month
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col xs={24} md={12} lg={8}>
          <Card title="Budget Utilization" extra={<Button type="link">Details</Button>}>
            <Statistic
              value={Math.round((dieselStats.budgetUsed / dieselStats.budget) * 100)}
              suffix="%"
              precision={0}
              valueStyle={{ fontSize: "24px" }}
            />
            <Progress
              percent={Math.round((dieselStats.budgetUsed / dieselStats.budget) * 100)}
              status={
                dieselStats.budgetUsed / dieselStats.budget > 0.9
                  ? "exception"
                  : dieselStats.budgetUsed / dieselStats.budget > 0.7
                    ? "exception"
                    : "normal"
              }
            />
            <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-between" }}>
              <Text>Used: ${dieselStats.budgetUsed}</Text>
              <Text>Budget: ${dieselStats.budget}</Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card title="Fuel Efficiency" extra={<Button type="link">Details</Button>}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <Statistic
                title="Avg. Consumption"
                value={dieselStats.avgConsumption}
                suffix="L/100km"
                precision={1}
              />
              <div>
                <BarChartOutlined />
                <Text
                  type={dieselStats.efficiencyChange < 0 ? "success" : "danger"}
                  style={{ marginLeft: "8px" }}
                >
                  {dieselStats.efficiencyChange < 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                  {Math.abs(dieselStats.efficiencyChange)}% from last month
                </Text>
              </div>
            </div>

            <Row>
              <Col span={8} style={{ textAlign: "center" }}>
                <Statistic
                  title="Best"
                  value={7.8}
                  suffix="L/100km"
                  valueStyle={{ color: "#3f8600", fontSize: "16px" }}
                />
                <Text type="secondary">Truck 104</Text>
              </Col>
              <Col span={8} style={{ textAlign: "center" }}>
                <Statistic
                  title="Average"
                  value={8.5}
                  suffix="L/100km"
                  valueStyle={{ fontSize: "16px" }}
                />
              </Col>
              <Col span={8} style={{ textAlign: "center" }}>
                <Statistic
                  title="Worst"
                  value={9.6}
                  suffix="L/100km"
                  valueStyle={{ color: "#cf1322", fontSize: "16px" }}
                />
                <Text type="secondary">Truck 102</Text>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Driver Performance" extra={<Button type="link">Details</Button>}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="driver-rating">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Space>
                    <UserOutlined />
                    <Text strong>John Doe</Text>
                  </Space>
                  <Tag color="green">7.9 L/100km</Tag>
                </div>
                <Progress percent={90} size="small" />
              </div>

              <div className="driver-rating">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Space>
                    <UserOutlined />
                    <Text strong>Sarah Williams</Text>
                  </Space>
                  <Tag color="green">8.1 L/100km</Tag>
                </div>
                <Progress percent={85} size="small" />
              </div>

              <div className="driver-rating">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Space>
                    <UserOutlined />
                    <Text strong>Mike Johnson</Text>
                  </Space>
                  <Tag color="blue">8.5 L/100km</Tag>
                </div>
                <Progress percent={78} size="small" />
              </div>

              <div className="driver-rating">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Space>
                    <UserOutlined />
                    <Text strong>Jane Smith</Text>
                  </Space>
                  <Tag color="orange">9.2 L/100km</Tag>
                </div>
                <Progress percent={65} size="small" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col xs={24}>
          <Card
            title="Recent Fuel Transactions"
            extra={
              <Button type="primary" size="small">
                View All
              </Button>
            }
          >
            <Table
              dataSource={recentFuelTransactions}
              columns={columns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col xs={24}>
          <Card
            title={
              <Space>
                <AlertOutlined style={{ color: "#f5222d" }} />
                <Text strong>Fuel Alerts</Text>
              </Space>
            }
            extra={
              <Button type="primary" size="small">
                View All
              </Button>
            }
          >
            <Table dataSource={fuelAlerts} columns={alertColumns} pagination={false} size="small" />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DieselDashboardComponent;
