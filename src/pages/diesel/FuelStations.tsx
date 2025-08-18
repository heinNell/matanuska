import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  PlusOutlined,
  StarOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Rate,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface FuelStation {
  id: string;
  name: string;
  brand: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  pricePerLiter: number;
  rating: number;
  isPreferred: boolean;
  hasCardAccess: boolean;
  operatingHours: string;
  services: string[];
  lastUpdated: string; // ISO string for UI display
  status: "active" | "inactive" | "maintenance";
}

const FuelStations: React.FC = () => {
  // Firestore-backed fuel stations
  const [fuelStations, setFuelStations] = useState<FuelStation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [subscribing, setSubscribing] = useState<boolean>(false);

  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStation, setEditingStation] = useState<FuelStation | null>(null);
  const [form] = Form.useForm();

  const getStatusTag = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Active
          </Tag>
        );
      case "inactive":
        return (
          <Tag icon={<CloseCircleOutlined />} color="default">
            Inactive
          </Tag>
        );
      case "maintenance":
        return (
          <Tag icon={<ClockCircleOutlined />} color="warning">
            Maintenance
          </Tag>
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getBrandColor = (brand: string) => {
    switch (brand.toLowerCase()) {
      case "shell":
        return "#FFD700";
      case "chevron":
        return "#0066CC";
      case "bp":
        return "#00A651";
      case "exxon":
        return "#FF0000";
      default:
        return "#1890ff";
    }
  };

  // Convert raw Firebase data to FuelStation type with proper type checks
  const convertToFuelStation = (id: string, raw: any): FuelStation => {
    const lastUpdated = (() => {
      if (raw.lastUpdated instanceof Timestamp) {
        return raw.lastUpdated.toDate().toISOString().split("T")[0];
      }
      if (typeof raw.lastUpdated === "string") {
        return raw.lastUpdated;
      }
      return new Date().toISOString().split("T")[0];
    })();

    return {
      id,
      name: raw.name?.toString() ?? "Unnamed",
      brand: raw.brand?.toString() ?? "Other",
      address: raw.address?.toString() ?? "",
      city: raw.city?.toString() ?? "",
      state: raw.state?.toString() ?? "",
      zipCode: raw.zipCode?.toString() ?? "",
      phone: raw.phone?.toString() ?? "",
      pricePerLiter: Number(raw.pricePerLiter) || 0,
      rating: Number(raw.rating) || 0,
      isPreferred: Boolean(raw.isPreferred),
      hasCardAccess: Boolean(raw.hasCardAccess),
      operatingHours: raw.operatingHours?.toString() ?? "",
      services: Array.isArray(raw.services) ? raw.services : [],
      lastUpdated,
      status: ["active", "inactive", "maintenance"].includes(raw.status)
        ? (raw.status as FuelStation["status"])
        : "active",
    };
  };

  // Subscribe to Firestore collection
  useEffect(() => {
    if (subscribing) return; // avoid double subscription
    setSubscribing(true);
    const q = query(collection(db, "fuelStations"), orderBy("name"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data: FuelStation[] = snap.docs.map((d) =>
          convertToFuelStation(d.id, d.data())
        );
        setFuelStations(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading fuel stations:", err);
        message.error("Failed to load fuel stations");
        setLoading(false);
      }
    );
    return () => unsub();
  }, [subscribing]);

  const handleAddEdit = async (values: Partial<FuelStation>) => {
    try {
      const sanitizedValues = {
        ...values,
        services: values.services || [],
        isPreferred: Boolean(values.isPreferred),
        hasCardAccess: Boolean(values.hasCardAccess),
        pricePerLiter: Number(values.pricePerLiter) || 0,
        rating: Number(values.rating) || 0,
        lastUpdated: serverTimestamp(),
      };

      if (editingStation) {
        await updateDoc(doc(db, "fuelStations", editingStation.id), sanitizedValues);
        message.success("Fuel station updated successfully");
      } else {
        await addDoc(collection(db, "fuelStations"), sanitizedValues);
        message.success("Fuel station added successfully");
      }
      setIsModalVisible(false);
      setEditingStation(null);
      form.resetFields();
    } catch (err) {
      console.error("Error saving fuel station:", err);
      message.error("Failed to save fuel station");
    }
  };

  const handleEdit = (station: FuelStation) => {
    setEditingStation(station);
    form.setFieldsValue(station);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "fuelStations", id));
      message.success("Fuel station deleted successfully");
    } catch (err) {
      console.error("Error deleting fuel station:", err);
      message.error("Failed to delete fuel station");
    }
  };

  const togglePreferred = async (id: string) => {
    const target = fuelStations.find((f) => f.id === id);
    if (!target) return;
    try {
      await updateDoc(doc(db, "fuelStations", id), {
        isPreferred: !target.isPreferred,
        lastUpdated: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error updating preferred status:", err);
      message.error("Failed to update preferred status");
    }
  };

  const filteredStations = fuelStations.filter((station) => {
    const searchLower = searchText.toLowerCase();
    return [
      station.name,
      station.brand,
      station.address,
      station.city,
    ].some(field => field.toLowerCase().includes(searchLower));
  });

  const columns: ColumnsType<FuelStation> = [
    {
      title: "Station Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: FuelStation, b: FuelStation) => a.name.localeCompare(b.name),
      render: (text: string, record: FuelStation) => (
        <Space direction="vertical" size="small">
          <div style={{ display: "flex", alignItems: "center" }}>
            <Text strong>{text}</Text>
            {record.isPreferred && <StarOutlined style={{ color: "#faad14", marginLeft: "8px" }} />}
          </div>
          <Tag color={getBrandColor(record.brand)}>{record.brand}</Tag>
        </Space>
      ),
    },
    {
      title: "Location",
      key: "location",
      render: (_: any, record: FuelStation) => (
        <Space direction="vertical" size="small">
          <Text>{record.address}</Text>
          <Text type="secondary">
            {record.city}, {record.state} {record.zipCode}
          </Text>
        </Space>
      ),
      sorter: (a: FuelStation, b: FuelStation) => a.city.localeCompare(b.city),
    },
    {
      title: "Price/L",
      dataIndex: "pricePerLiter",
      key: "pricePerLiter",
      render: (text: number) => `$${text.toFixed(3)}`,
      sorter: (a: FuelStation, b: FuelStation) => a.pricePerLiter - b.pricePerLiter,
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (text: number) => <Rate disabled defaultValue={text} allowHalf />,
      sorter: (a: FuelStation, b: FuelStation) => a.rating - b.rating,
    },
    {
      title: "Hours",
      dataIndex: "operatingHours",
      key: "operatingHours",
    },
    {
      title: "Card Access",
      dataIndex: "hasCardAccess",
      key: "hasCardAccess",
      render: (text: boolean) =>
        text ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Yes
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="default">
            No
          </Tag>
        ),
      filters: [
        { text: "Has Card Access", value: true },
        { text: "No Card Access", value: false },
      ],
      onFilter: (value, record) => record.hasCardAccess === (value === true || value === "true"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text: string) => getStatusTag(text),
      filters: [
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
        { text: "Maintenance", value: "maintenance" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: FuelStation) => (
        <Space size="small">
          <Button icon={<EyeOutlined />} type="link" size="small" title="View Details" />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="link"
            size="small"
            title="Edit"
          />
          <Button
            icon={<StarOutlined />}
            onClick={() => togglePreferred(record.id)}
            type="link"
            size="small"
            style={{ color: record.isPreferred ? "#faad14" : "#d9d9d9" }}
            title={record.isPreferred ? "Remove from Preferred" : "Add to Preferred"}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            type="link"
            danger
            size="small"
            title="Delete"
          />
        </Space>
      ),
    },
  ];

  // Calculate summary statistics
  const preferredStations = fuelStations.filter((station) => station.isPreferred).length;
  const avgPrice = fuelStations.length
    ? fuelStations.reduce((sum, station) => sum + station.pricePerLiter, 0) / fuelStations.length
    : 0;
  const avgRating = fuelStations.length
    ? fuelStations.reduce((sum, station) => sum + station.rating, 0) / fuelStations.length
    : 0;

  return (
    <div className="fuel-stations-page">
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
              <EnvironmentOutlined style={{ marginRight: "8px" }} />
              Fuel Stations
            </Title>
            <Text type="secondary">
              Manage your network of preferred fuel stations and track pricing
            </Text>
          </div>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
              Add Station
            </Button>
          </Space>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <Text type="secondary">Total Stations</Text>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#1890ff" }}>
                  {fuelStations.length}
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <Text type="secondary">Preferred Stations</Text>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#faad14" }}>
                  {preferredStations}
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <Text type="secondary">Avg. Price</Text>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#52c41a" }}>
                  ${avgPrice.toFixed(3)}
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <Text type="secondary">Avg. Rating</Text>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#722ed1" }}>
                  {avgRating.toFixed(1)} ⭐
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <div style={{ marginBottom: "16px" }}>
          <Search
            placeholder="Search stations..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </div>

        <Divider orientation="left">Station Directory</Divider>

        <Table
          dataSource={filteredStations}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ margin: 0 }}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Space direction="vertical">
                      <Text strong>Contact Information:</Text>
                      <Text>📞 {record.phone}</Text>
                      <Text strong>Services:</Text>
                      <Space wrap>
                        {record.services.map((service) => (
                          <Tag key={service} color="blue">
                            {service}
                          </Tag>
                        ))}
                      </Space>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space direction="vertical">
                      <Text strong>Last Updated:</Text>
                      <Text>{record.lastUpdated}</Text>
                      <Text strong>Operating Hours:</Text>
                      <Text>{record.operatingHours}</Text>
                    </Space>
                  </Col>
                </Row>
              </div>
            ),
          }}
        />

        <Modal
          title={editingStation ? "Edit Fuel Station" : "Add Fuel Station"}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingStation(null);
            form.resetFields();
          }}
          footer={null}
          width={800}
        >
          <Form form={form} layout="vertical" onFinish={handleAddEdit}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Station Name"
                  rules={[{ required: true, message: "Please enter station name" }]}
                >
                  <Input placeholder="e.g., Shell Travel Center" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="brand"
                  label="Brand"
                  rules={[{ required: true, message: "Please select a brand" }]}
                >
                  <Select placeholder="Select brand">
                    <Option value="Shell">Shell</Option>
                    <Option value="Chevron">Chevron</Option>
                    <Option value="BP">BP</Option>
                    <Option value="Exxon">Exxon</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true, message: "Please enter address" }]}
            >
              <Input placeholder="Street address" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="city"
                  label="City"
                  rules={[{ required: true, message: "Please enter city" }]}
                >
                  <Input placeholder="City" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="state"
                  label="State"
                  rules={[{ required: true, message: "Please enter state" }]}
                >
                  <Input placeholder="State" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="zipCode"
                  label="ZIP Code"
                  rules={[{ required: true, message: "Please enter ZIP code" }]}
                >
                  <Input placeholder="ZIP Code" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="Phone"
                  rules={[{ required: true, message: "Please enter phone number" }]}
                >
                  <Input placeholder="(555) 123-4567" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="pricePerLiter"
                  label="Price per Liter ($)"
                  rules={[{ required: true, message: "Please enter price" }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    precision={3}
                    placeholder="1.250"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="operatingHours"
                  label="Operating Hours"
                  rules={[{ required: true, message: "Please enter operating hours" }]}
                >
                  <Input placeholder="e.g., 24/7 or 6:00 AM - 10:00 PM" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="rating"
                  label="Rating"
                  rules={[{ required: true, message: "Please provide a rating" }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={1}
                    max={5}
                    step={0.1}
                    precision={1}
                    placeholder="4.5"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="isPreferred" label="Preferred Station" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="hasCardAccess" label="Card Access" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: "Please select status" }]}
                >
                  <Select placeholder="Select status">
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                    <Option value="maintenance">Maintenance</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="services" label="Services">
              <Select mode="multiple" placeholder="Select available services">
                <Option value="Diesel">Diesel</Option>
                <Option value="DEF">DEF (Diesel Exhaust Fluid)</Option>
                <Option value="Truck Wash">Truck Wash</Option>
                <Option value="Truck Parking">Truck Parking</Option>
                <Option value="Restaurant">Restaurant</Option>
                <Option value="Convenience Store">Convenience Store</Option>
                <Option value="Truck Repair">Truck Repair</Option>
                <Option value="ATM">ATM</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingStation ? "Update" : "Add"} Station
                </Button>
                <Button
                  onClick={() => {
                    setIsModalVisible(false);
                    setEditingStation(null);
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

export default FuelStations;
