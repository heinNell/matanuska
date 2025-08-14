import {
  BarChartOutlined,
  CarOutlined,
  DownloadOutlined,
  EnvironmentOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import React, { useState } from "react";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface EfficiencyData {
  vehicleId: string;
  vehicleName: string;
  driverId: string;
  driverName: string;
  period: string;
  fuelConsumed: number;
  distanceTraveled: number;
  efficiency: number;
  target: number;
  performance: "excellent" | "good" | "average" | "poor";
  cost: number;
}

const FuelEfficiencyReport: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedVehicle, setSelectedVehicle] = useState("all");

  // Mock data
  const efficiencyData: EfficiencyData[] = [
    {
      vehicleId: "V001",
      vehicleName: "Truck 101 - Kenworth T680",
      driverId: "D001",
      driverName: "John Doe",
      period: "November 2023",
      fuelConsumed: 1250,
      distanceTraveled: 15500,
      efficiency: 8.1,
      target: 8.5,
      performance: "excellent",
      cost: 1562.5,
    },
    {
      vehicleId: "V002",
      vehicleName: "Truck 102 - Freightliner Cascadia",
      driverId: "D002",
      driverName: "Jane Smith",
      period: "November 2023",
      fuelConsumed: 1420,
      distanceTraveled: 14800,
      efficiency: 9.6,
      target: 8.5,
      performance: "poor",
      cost: 1775.0,
    },
    {
      vehicleId: "V003",
      vehicleName: "Truck 103 - Peterbilt 579",
      driverId: "D003",
      driverName: "Mike Johnson",
      period: "November 2023",
      fuelConsumed: 1180,
      distanceTraveled: 13200,
      efficiency: 8.9,
      target: 8.5,
      performance: "average",
      cost: 1475.0,
    },
    {
      vehicleId: "V004",
      vehicleName: "Truck 104 - Volvo VNL",
      driverId: "D004",
      driverName: "Sarah Williams",
      period: "November 2023",
      fuelConsumed: 1050,
      distanceTraveled: 13500,
      efficiency: 7.8,
      target: 8.5,
      performance: "excellent",
      cost: 1312.5,
    },
  ];

  const getPerformanceTag = (performance: string) => {
    switch (performance) {
      case "excellent":
        return <Tag color="green">Excellent</Tag>;
      case "good":
        return <Tag color="blue">Good</Tag>;
      case "average":
        return <Tag color="orange">Average</Tag>;
      case "poor":
        return <Tag color="red">Poor</Tag>;
      default:
        return <Tag color="default">{performance}</Tag>;
    }
  };

  const getEfficiencyProgress = (efficiency: number, target: number) => {
    const percentage = Math.min((target / efficiency) * 100, 100);
    let status: "success" | "normal" | "exception" = "normal";

    if (efficiency <= target * 0.9) status = "success";
    else if (efficiency > target * 1.1) status = "exception";

    return (
      <Progress
        percent={percentage}
        status={status}
        size="small"
        format={() => `${efficiency} L/100km`}
      />
    );
  };

  const columns = [
    {
      title: "Vehicle",
      dataIndex: "vehicleName",
      key: "vehicleName",
      sorter: (a: EfficiencyData, b: EfficiencyData) => a.vehicleName.localeCompare(b.vehicleName),
    },
    {
      title: "Driver",
      dataIndex: "driverName",
      key: "driverName",
      sorter: (a: EfficiencyData, b: EfficiencyData) => a.driverName.localeCompare(b.driverName),
    },
    {
      title: "Distance (km)",
      dataIndex: "distanceTraveled",
      key: "distanceTraveled",
      render: (text: number) => text.toLocaleString(),
      sorter: (a: EfficiencyData, b: EfficiencyData) => a.distanceTraveled - b.distanceTraveled,
    },
    {
      title: "Fuel Used (L)",
      dataIndex: "fuelConsumed",
      key: "fuelConsumed",
      render: (text: number) => text.toLocaleString(),
      sorter: (a: EfficiencyData, b: EfficiencyData) => a.fuelConsumed - b.fuelConsumed,
    },
    {
      title: "Efficiency",
      key: "efficiency",
      render: (_: any, record: EfficiencyData) =>
        getEfficiencyProgress(record.efficiency, record.target),
      sorter: (a: EfficiencyData, b: EfficiencyData) => a.efficiency - b.efficiency,
    },
    {
      title: "vs Target",
      key: "vsTarget",
      render: (_: any, record: EfficiencyData) => {
        const diff = record.efficiency - record.target;
        const isGood = diff <= 0;
        return (
          <Text type={isGood ? "success" : "danger"}>
            {isGood ? "-" : "+"}
            {Math.abs(diff).toFixed(1)} L/100km
          </Text>
        );
      },
      sorter: (a: EfficiencyData, b: EfficiencyData) =>
        a.efficiency - a.target - (b.efficiency - b.target),
    },
    {
      title: "Performance",
      dataIndex: "performance",
      key: "performance",
      render: (text: string) => getPerformanceTag(text),
      filters: [
        { text: "Excellent", value: "excellent" },
        { text: "Good", value: "good" },
        { text: "Average", value: "average" },
        { text: "Poor", value: "poor" },
      ],
      onFilter: (value: any, record: EfficiencyData) => record.performance === value,
    },
    {
      title: "Cost ($)",
      dataIndex: "cost",
      key: "cost",
      render: (text: number) => `$${text.toFixed(2)}`,
      sorter: (a: EfficiencyData, b: EfficiencyData) => a.cost - b.cost,
    },
  ];

  // Calculate summary statistics
  const totalFuel = efficiencyData.reduce((sum, item) => sum + item.fuelConsumed, 0);
  const totalDistance = efficiencyData.reduce((sum, item) => sum + item.distanceTraveled, 0);
  const totalCost = efficiencyData.reduce((sum, item) => sum + item.cost, 0);
  const avgEfficiency = (totalFuel / totalDistance) * 100;
  const targetEfficiency = 8.5;

  return (
    <div className="fuel-efficiency-report-page">
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
              <LineChartOutlined style={{ marginRight: "8px" }} />
              Fuel Efficiency Report
            </Title>
            <Text type="secondary">Analyze fuel consumption and efficiency across your fleet</Text>
          </div>
          <Space>
            <Button icon={<DownloadOutlined />}>Export Report</Button>
            <Button type="primary">Generate Custom Report</Button>
          </Space>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Fleet Average"
                value={avgEfficiency}
                precision={1}
                suffix="L/100km"
                prefix={<CarOutlined />}
                valueStyle={{
                  color: avgEfficiency <= targetEfficiency ? "#3f8600" : "#cf1322",
                }}
              />
              <Text type="secondary">Target: {targetEfficiency} L/100km</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Distance"
                value={totalDistance}
                suffix="km"
                prefix={<EnvironmentOutlined />}
              />
              <Text type="secondary">This period</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Fuel"
                value={totalFuel}
                suffix="L"
                prefix={<BarChartOutlined />}
              />
              <Text type="secondary">Consumed</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Cost"
                value={totalCost}
                prefix="$"
                precision={2}
                valueStyle={{ color: "#1890ff" }}
              />
              <Text type="secondary">Fuel expenses</Text>
            </Card>
          </Col>
        </Row>

        <Card title="Filters" style={{ marginBottom: "24px" }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Text strong>Period:</Text>
              <Select
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                style={{ width: "100%", marginTop: "4px" }}
              >
                <Option value="daily">Daily</Option>
                <Option value="weekly">Weekly</Option>
                <Option value="monthly">Monthly</Option>
                <Option value="quarterly">Quarterly</Option>
                <Option value="yearly">Yearly</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Text strong>Vehicle:</Text>
              <Select
                value={selectedVehicle}
                onChange={setSelectedVehicle}
                style={{ width: "100%", marginTop: "4px" }}
              >
                <Option value="all">All Vehicles</Option>
                <Option value="V001">Truck 101</Option>
                <Option value="V002">Truck 102</Option>
                <Option value="V003">Truck 103</Option>
                <Option value="V004">Truck 104</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Text strong>Date Range:</Text>
              <RangePicker style={{ width: "100%", marginTop: "4px" }} />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Text strong>&nbsp;</Text>
              <Button type="primary" style={{ width: "100%", marginTop: "4px" }}>
                Apply Filters
              </Button>
            </Col>
          </Row>
        </Card>

        <Divider orientation="left">Efficiency Analysis</Divider>

        <Table
          dataSource={efficiencyData}
          columns={columns}
          rowKey="vehicleId"
          pagination={{ pageSize: 10 }}
          summary={(pageData) => {
            const pageTotalFuel = pageData.reduce((sum, item) => sum + item.fuelConsumed, 0);
            const pageTotalDistance = pageData.reduce(
              (sum, item) => sum + item.distanceTraveled,
              0
            );
            const pageTotalCost = pageData.reduce((sum, item) => sum + item.cost, 0);
            const pageAvgEfficiency = (pageTotalFuel / pageTotalDistance) * 100;

            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <Text strong>Summary:</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <Text strong>{pageTotalDistance.toLocaleString()} km</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    <Text strong>{pageTotalFuel.toLocaleString()} L</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4}>
                    <Text strong>{pageAvgEfficiency.toFixed(1)} L/100km</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5}></Table.Summary.Cell>
                  <Table.Summary.Cell index={6}></Table.Summary.Cell>
                  <Table.Summary.Cell index={7}>
                    <Text strong>${pageTotalCost.toFixed(2)}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            );
          }}
        />

        <Card title="Performance Insights" style={{ marginTop: "24px" }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card title="Best Performer" type="inner">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text>Vehicle:</Text>
                    <Text strong>Truck 104</Text>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text>Driver:</Text>
                    <Text strong>Sarah Williams</Text>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text>Efficiency:</Text>
                    <Text strong style={{ color: "#3f8600" }}>
                      7.8 L/100km
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="Needs Improvement" type="inner">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text>Vehicle:</Text>
                    <Text strong>Truck 102</Text>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text>Driver:</Text>
                    <Text strong>Jane Smith</Text>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text>Efficiency:</Text>
                    <Text strong style={{ color: "#cf1322" }}>
                      9.6 L/100km
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="Potential Savings" type="inner">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text>If all vehicles matched best:</Text>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text>Fuel saved:</Text>
                    <Text strong style={{ color: "#3f8600" }}>
                      ~320 L
                    </Text>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text>Cost saved:</Text>
                    <Text strong style={{ color: "#3f8600" }}>
                      ~$400
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </Card>
      </Card>
    </div>
  );
};

export default FuelEfficiencyReport;
