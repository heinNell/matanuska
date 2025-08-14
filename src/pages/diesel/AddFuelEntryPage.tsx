import { CloseOutlined, SaveOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Calendar,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
  Upload,
  message,
} from "antd";
import { Truck } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useOfflineForm from "../../hooks/useOfflineForm";

const { Title, Text } = Typography;
const { Option } = Select;

interface FuelEntry {
  vehicleId: string;
  driverId: string;
  date: string;
  fuelAmount: number;
  odometerReading: number;
  costPerLiter: number;
  totalCost: number;
  location: string;
  fuelCardNumber?: string;
  notes?: string;
  receiptImage?: File | null;
}

const AddFuelEntryPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [calculatedCost, setCalculatedCost] = useState<number | null>(null);
  const navigate = useNavigate();
  const { submit, isSubmitting, isOfflineOperation, error } = useOfflineForm({
    collectionPath: "fuelEntries",
    showOfflineWarning: true,
  });

  const vehicles = [
    { id: "V001", name: "Truck 101 - Kenworth T680" },
    { id: "V002", name: "Truck 102 - Freightliner Cascadia" },
    { id: "V003", name: "Truck 103 - Peterbilt 579" },
    { id: "V004", name: "Truck 104 - Volvo VNL" },
  ];

  const drivers = [
    { id: "D001", name: "John Doe" },
    { id: "D002", name: "Jane Smith" },
    { id: "D003", name: "Mike Johnson" },
    { id: "D004", name: "Sarah Williams" },
  ];

  const fuelCards = [
    { id: "FC001", number: "**** **** **** 1234" },
    { id: "FC002", number: "**** **** **** 5678" },
    { id: "FC003", number: "**** **** **** 9012" },
  ];

  const calculateTotalCost = (amount: number | null, costPerLiter: number | null) => {
    if (amount && costPerLiter) {
      const total = amount * costPerLiter;
      setCalculatedCost(total);
      form.setFieldsValue({ totalCost: total });
    }
  };

  const handleFuelAmountChange = (value: number | null) => {
    if (value === null) return;
    const costPerLiter = form.getFieldValue("costPerLiter");
    calculateTotalCost(value, costPerLiter);
  };

  const handleCostPerLiterChange = (value: number | null) => {
    if (value === null) return;
    const fuelAmount = form.getFieldValue("fuelAmount");
    calculateTotalCost(fuelAmount, value);
  };

  const onFinish = async (values: FuelEntry) => {
    setLoading(true);
    try {
      await submit(values);
      message.success(
        isOfflineOperation
          ? "Fuel entry queued and will sync when online"
          : "Fuel entry added successfully"
      );
      navigate("/diesel/fuel-logs");
    } catch (e) {
      console.error("Error adding fuel entry:", e);
      message.error("Failed to add fuel entry");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/diesel");
  };

  // Display a calendar view for reference (using the imported Calendar component)
  const renderCalendarView = () => {
    return (
      <div
        className="calendar-view-container"
        style={{ marginBottom: "20px", display: loading ? "none" : "block" }}
      >
        <Calendar fullscreen={false} />
      </div>
    );
  };

  // Display a truck icon with vehicle information
  const renderVehicleIcon = () => {
    const selectedVehicleId = form.getFieldValue("vehicleId");
    const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

    return (
      <div
        className="vehicle-icon-container"
        style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}
      >
        <Truck className="w-6 h-6 mr-2 text-blue-500" />
        <span>{selectedVehicle ? selectedVehicle.name : "Select a vehicle"}</span>
      </div>
    );
  };

  return (
    <div className="add-fuel-entry-page">
      <Card>
        <Title level={3}>Add Fuel Entry</Title>
        <Text type="secondary">Record a new fuel purchase for your fleet vehicles</Text>

        {/* Use the Truck component */}
        {form.getFieldValue("vehicleId") && renderVehicleIcon()}

        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            date: null,
            fuelAmount: null,
            odometerReading: null,
            costPerLiter: null,
            totalCost: null,
          }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="vehicleId"
                label="Vehicle"
                rules={[{ required: true, message: "Please select a vehicle" }]}
              >
                <Select placeholder="Select vehicle">
                  {vehicles.map((vehicle) => (
                    <Option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="driverId"
                label="Driver"
                rules={[{ required: true, message: "Please select a driver" }]}
              >
                <Select placeholder="Select driver">
                  {drivers.map((driver) => (
                    <Option key={driver.id} value={driver.id}>
                      {driver.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="date"
                label="Date of Purchase"
                rules={[{ required: true, message: "Please select a date" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="location"
                label="Fuel Station Location"
                rules={[{ required: true, message: "Please enter the location" }]}
              >
                <Input placeholder="E.g., Shell Station, Highway 95" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <Form.Item
                name="fuelAmount"
                label="Fuel Amount (Liters)"
                rules={[{ required: true, message: "Please enter fuel amount" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  precision={2}
                  onChange={handleFuelAmountChange}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="costPerLiter"
                label="Cost Per Liter ($)"
                rules={[{ required: true, message: "Please enter cost per liter" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  precision={3}
                  onChange={handleCostPerLiterChange}
                  placeholder="0.000"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="totalCost"
                label="Total Cost ($)"
                rules={[{ required: true, message: "Please enter total cost" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  precision={2}
                  disabled
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="odometerReading"
                label="Odometer Reading (km)"
                rules={[{ required: true, message: "Please enter odometer reading" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  precision={0}
                  placeholder="Enter current odometer reading"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="fuelCardNumber" label="Fuel Card Used">
                <Select placeholder="Select fuel card (optional)">
                  <Option value="">No fuel card used</Option>
                  {fuelCards.map((card) => (
                    <Option key={card.id} value={card.id}>
                      {card.number}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea
              rows={3}
              placeholder="Any additional information about this fuel purchase"
            />
          </Form.Item>

          <Form.Item
            name="receiptImage"
            label="Receipt Image"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Upload name="receiptImage" listType="picture" beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Upload Receipt</Button>
            </Upload>
          </Form.Item>

          {calculatedCost !== null && (
            <Alert
              message={`Calculated Cost: $${calculatedCost.toFixed(2)}`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Divider />

          {/* Add Calendar component for date reference */}
          {renderCalendarView()}

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading || isSubmitting}
                icon={<SaveOutlined />}
              >
                Submit Entry
              </Button>
              <Button danger onClick={handleCancel} icon={<CloseOutlined />}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
        {error && (
          <Alert
            message="Failed to save fuel entry"
            description={error.message}
            type="error"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Card>
    </div>
  );
};

export default AddFuelEntryPage;
