import {
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FireOutlined,
  LineChartOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import type { TableProps } from "antd";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import React, { useState } from "react";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface AlertData {
  id: string;
  timestamp: string;
  vehicleId: string;
  vehicleName: string;
  driverId: string;
  driverName: string;
  alertType: string;
  severity: "high" | "medium" | "low";
  status: "pending" | "investigating" | "resolved" | "false_alarm";
  description: string;
  details: string;
  location: string;
  assignedTo?: string;
}

interface TheftPattern {
  id: string;
  name: string;
  description: string;
  alertsGenerated: number;
  truePositiveRate: number;
  lastDetection: string;
  status: "active" | "disabled" | "testing";
}

const FuelTheftDetection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("1");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Mock data for alerts
  const mockAlerts: AlertData[] = [
    {
      id: "1",
      timestamp: "2023-11-19 15:32:45",
      vehicleId: "V001",
      vehicleName: "Truck 101 - Kenworth T680",
      driverId: "D001",
      driverName: "John Doe",
      alertType: "unusual_volume",
      severity: "high",
      status: "investigating",
      description: "Fuel volume decrease inconsistent with engine usage",
      details: "Detected 35L fuel loss while vehicle was parked overnight",
      location: "Company Yard, Bay 12",
    },
    {
      id: "2",
      timestamp: "2023-11-18 08:12:33",
      vehicleId: "V003",
      vehicleName: "Truck 103 - Peterbilt 579",
      driverId: "D003",
      driverName: "Mike Johnson",
      alertType: "multiple_fills",
      severity: "medium",
      status: "resolved",
      description: "Multiple fuel fills within short time period",
      details: "Two fuel purchases within 1 hour at different locations",
      location: "Route 66, Mile 235",
      assignedTo: "Security Team",
    },
    {
      id: "3",
      timestamp: "2023-11-17 22:45:12",
      vehicleId: "V002",
      vehicleName: "Truck 102 - Freightliner Cascadia",
      driverId: "D002",
      driverName: "Jane Smith",
      alertType: "after_hours",
      severity: "medium",
      status: "pending",
      description: "Fuel activity detected outside of working hours",
      details: "Fuel level decrease at 1:30 AM while vehicle was inactive",
      location: "Rest Stop, Interstate 80",
    },
    {
      id: "4",
      timestamp: "2023-11-16 14:22:18",
      vehicleId: "V004",
      vehicleName: "Truck 104 - Volvo VNL",
      driverId: "D004",
      driverName: "Sarah Williams",
      alertType: "efficiency_anomaly",
      severity: "low",
      status: "false_alarm",
      description: "Unusual fuel efficiency drop",
      details: "Efficiency dropped by 25% over last 500km",
      location: "Various locations",
    },
  ];

  // Mock data for theft patterns
  const theftPatterns: TheftPattern[] = [
    {
      id: "TP1",
      name: "Overnight Level Drop",
      description: "Detects significant fuel level drops when vehicle is parked overnight",
      alertsGenerated: 12,
      truePositiveRate: 75,
      lastDetection: "2023-11-19",
      status: "active",
    },
    {
      id: "TP2",
      name: "Multiple Rapid Fills",
      description: "Identifies multiple fill-ups in short time periods at different locations",
      alertsGenerated: 8,
      truePositiveRate: 62.5,
      lastDetection: "2023-11-18",
      status: "active",
    },
    {
      id: "TP3",
      name: "Off-Route Fueling",
      description: "Detects fueling activity at unauthorized locations",
      alertsGenerated: 15,
      truePositiveRate: 80,
      lastDetection: "2023-11-17",
      status: "active",
    },
    {
      id: "TP4",
      name: "After Hours Activity",
      description: "Monitors for fuel level changes during non-working hours",
      alertsGenerated: 10,
      truePositiveRate: 70,
      lastDetection: "2023-11-16",
      status: "active",
    },
    {
      id: "TP5",
      name: "Machine Learning Pattern",
      description: "Advanced ML model to detect subtle theft patterns",
      alertsGenerated: 5,
      truePositiveRate: 90,
      lastDetection: "2023-11-15",
      status: "testing",
    },
  ];

  const getStatusTag = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Tag icon={<ClockCircleOutlined />} color="default">
            Pending
          </Tag>
        );
      case "investigating":
        return (
          <Tag icon={<ExclamationCircleOutlined />} color="processing">
            Investigating
          </Tag>
        );
      case "resolved":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Resolved
          </Tag>
        );
      case "false_alarm":
        return (
          <Tag icon={<CloseCircleOutlined />} color="warning">
            False Alarm
          </Tag>
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getSeverityTag = (severity: string) => {
    switch (severity) {
      case "high":
        return <Tag color="red">High</Tag>;
      case "medium":
        return <Tag color="orange">Medium</Tag>;
      case "low":
        return <Tag color="blue">Low</Tag>;
      default:
        return <Tag color="default">{severity}</Tag>;
    }
  };

  const getAlertTypeTag = (type: string) => {
    switch (type) {
      case "unusual_volume":
        return (
          <Tag color="red">
            <FireOutlined /> Unusual Volume
          </Tag>
        );
      case "multiple_fills":
        return (
          <Tag color="purple">
            <CarOutlined /> Multiple Fills
          </Tag>
        );
      case "after_hours":
        return (
          <Tag color="volcano">
            <ClockCircleOutlined /> After Hours
          </Tag>
        );
      case "efficiency_anomaly":
        return (
          <Tag color="cyan">
            <LineChartOutlined /> Efficiency Anomaly
          </Tag>
        );
      default:
        return <Tag color="default">{type}</Tag>;
    }
  };

  const getPatternStatusTag = (status: string) => {
    switch (status) {
      case "active":
        return <Tag color="green">Active</Tag>;
      case "disabled":
        return <Tag color="red">Disabled</Tag>;
      case "testing":
        return <Tag color="blue">Testing</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const filteredAlerts =
    selectedStatus === "all"
      ? mockAlerts
      : mockAlerts.filter((alert) => alert.status === selectedStatus);

  const alertColumns: TableProps<AlertData>["columns"] = [
    {
      title: "Date & Time",
      dataIndex: "timestamp",
      key: "timestamp",
      sorter: (a: AlertData, b: AlertData) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    },
    {
      title: "Vehicle",
      dataIndex: "vehicleName",
      key: "vehicleName",
      sorter: (a: AlertData, b: AlertData) => a.vehicleName.localeCompare(b.vehicleName),
    },
    {
      title: "Alert Type",
      dataIndex: "alertType",
      key: "alertType",
      render: (text: string) => getAlertTypeTag(text),
      filters: [
        { text: "Unusual Volume", value: "unusual_volume" },
        { text: "Multiple Fills", value: "multiple_fills" },
        { text: "After Hours", value: "after_hours" },
        { text: "Efficiency Anomaly", value: "efficiency_anomaly" },
      ],
      onFilter: (value, record) => record.alertType.toString() === value.toString(),
    },
    {
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      render: (text: string) => getSeverityTag(text),
      filters: [
        { text: "High", value: "high" },
        { text: "Medium", value: "medium" },
        { text: "Low", value: "low" },
      ],
      onFilter: (value, record) => record.severity.toString() === value.toString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text: string) => getStatusTag(text),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} size="small">
            View
          </Button>
          <Button type="link" icon={<UserOutlined />} size="small">
            Assign
          </Button>
        </Space>
      ),
    },
  ];

  const patternColumns: TableProps<TheftPattern>["columns"] = [
    {
      title: "Pattern Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: TheftPattern, b: TheftPattern) => a.name.localeCompare(b.name),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Alerts Generated",
      dataIndex: "alertsGenerated",
      key: "alertsGenerated",
      sorter: (a: TheftPattern, b: TheftPattern) => a.alertsGenerated - b.alertsGenerated,
    },
    {
      title: "True Positive Rate",
      dataIndex: "truePositiveRate",
      key: "truePositiveRate",
      render: (text: number) => `${text}%`,
      sorter: (a: TheftPattern, b: TheftPattern) => a.truePositiveRate - b.truePositiveRate,
    },
    {
      title: "Last Detection",
      dataIndex: "lastDetection",
      key: "lastDetection",
      sorter: (a: TheftPattern, b: TheftPattern) =>
        new Date(a.lastDetection).getTime() - new Date(b.lastDetection).getTime(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text: string) => getPatternStatusTag(text),
      filters: [
        { text: "Active", value: "active" },
        { text: "Disabled", value: "disabled" },
        { text: "Testing", value: "testing" },
      ],
      onFilter: (value, record) => record.status.toString() === value.toString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: TheftPattern) => (
        <Space size="small">
          <Button type={record.status === "active" ? "default" : "primary"} size="small">
            {record.status === "active" ? "Disable" : "Enable"}
          </Button>
          <Button icon={<SettingOutlined />} size="small">
            Configure
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="fuel-theft-detection-page">
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div>
            <Title level={3}>
              <WarningOutlined style={{ color: "#f5222d", marginRight: "8px" }} />
              Fuel Theft Detection
            </Title>
            <Paragraph type="secondary">
              Monitor and manage potential fuel theft incidents across your fleet
            </Paragraph>
          </div>
          <Space>
            <Button type="primary">Configure Alerts</Button>
            <Button icon={<SettingOutlined />}>Settings</Button>
          </Space>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ backgroundColor: "#fff1f0", borderColor: "#ffa39e" }}>
              <Statistic
                title={<Text strong>Active Alerts</Text>}
                value={3}
                valueStyle={{ color: "#cf1322" }}
                prefix={<ExclamationCircleOutlined />}
              />
              <Text type="secondary">Requiring attention</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={<Text strong>Monthly Incidents</Text>}
                value={12}
                prefix={<WarningOutlined />}
              />
              <Text type="secondary">+3 from last month</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={<Text strong>Fuel Saved</Text>}
                value={245}
                suffix="L"
                precision={0}
                valueStyle={{ color: "#3f8600" }}
              />
              <Text type="secondary">Est. $306.25 value</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={<Text strong>Detection Accuracy</Text>}
                value={78.5}
                suffix="%"
                precision={1}
              />
              <Text type="secondary">Based on resolved cases</Text>
            </Card>
          </Col>
        </Row>

        <Alert
          message="System Notification"
          description="The theft detection system has been updated with new AI-powered patterns. Expect improved accuracy in detecting unusual fuel consumption patterns."
          type="info"
          showIcon
          closable
          style={{ marginBottom: "24px" }}
        />

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <Badge count={3} offset={[10, 0]}>
                  Active Alerts
                </Badge>
              </span>
            }
            key="1"
          >
            <div style={{ marginBottom: "16px" }}>
              <Space>
                <Select
                  defaultValue="all"
                  style={{ width: 150 }}
                  onChange={(value) => setSelectedStatus(value)}
                >
                  <Option value="all">All Statuses</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="investigating">Investigating</Option>
                  <Option value="resolved">Resolved</Option>
                  <Option value="false_alarm">False Alarm</Option>
                </Select>
                <RangePicker style={{ width: 250 }} />
              </Space>
            </div>

            <Table
              dataSource={filteredAlerts}
              columns={alertColumns}
              rowKey="id"
              expandable={{
                expandedRowRender: (record) => (
                  <div style={{ padding: "20px" }}>
                    <p>
                      <strong>Alert Details:</strong> {record.details}
                    </p>
                    {record.assignedTo && (
                      <p>
                        <strong>Assigned To:</strong> {record.assignedTo}
                      </p>
                    )}
                    <p>
                      <strong>Driver:</strong> {record.driverName}
                    </p>
                    <div style={{ marginTop: "10px" }}>
                      <Space>
                        <Button type="primary">Mark as Resolved</Button>
                        <Button>Mark as False Alarm</Button>
                        <Button>Add Notes</Button>
                      </Space>
                    </div>
                  </div>
                ),
              }}
            />
          </TabPane>

          <TabPane tab={<span>Detection Patterns</span>} key="2">
            <div style={{ marginBottom: "16px" }}>
              <Space>
                <Button type="primary">Add New Pattern</Button>
                <Button icon={<LineChartOutlined />}>View Pattern Analytics</Button>
                <Tooltip title="Detection patterns are rules used by the system to identify potential fuel theft incidents">
                  <Button icon={<QuestionCircleOutlined />}>Help</Button>
                </Tooltip>
              </Space>
            </div>

            <Table dataSource={theftPatterns} columns={patternColumns} rowKey="id" />
          </TabPane>

          <TabPane tab={<span>Reports</span>} key="3">
            <Divider orientation="left">Fuel Theft Reports</Divider>
            <Paragraph>The reporting dashboard will be available soon.</Paragraph>

            <Paragraph>
              Here you'll be able to:
              <ul>
                <li>Generate custom theft detection reports</li>
                <li>View historical theft patterns</li>
                <li>Analyze cost savings from the theft detection system</li>
                <li>Compare detection rates across locations and vehicles</li>
              </ul>
            </Paragraph>

            <Button type="primary" disabled>
              Generate Report
            </Button>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default FuelTheftDetection;
