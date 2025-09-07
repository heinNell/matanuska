import React, { useState } from 'react';
import { 
  Table, 
  Card, 
  Typography, 
  Button, 
  Space, 
  Input, 
  DatePicker, 
  Tag,
  Tooltip,
  Select,
  Divider
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface FuelLog {
  id: string;
  date: string;
  vehicleId: string;
  vehicleName: string;
  driverId: string;
  driverName: string;
  odometerReading: number;
  fuelAmount: number;
  costPerLiter: number;
  totalCost: number;
  location: string;
  fuelCardNumber?: string;
  notes?: string;
  receiptImage?: string;
  efficiency: number;
}

const FuelLogs: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const navigate = useNavigate();

  // Mock data
  const mockFuelLogs: FuelLog[] = [
    {
      id: '1',
      date: '2023-11-20',
      vehicleId: 'V001',
      vehicleName: 'Truck 101 - Kenworth T680',
      driverId: 'D001',
      driverName: 'John Doe',
      odometerReading: 125000,
      fuelAmount: 125.5,
      costPerLiter: 1.25,
      totalCost: 156.88,
      location: 'Shell Station, Highway 95',
      fuelCardNumber: '**** 1234',
      notes: 'Regular fill up',
      efficiency: 8.2
    },
    {
      id: '2',
      date: '2023-11-19',
      vehicleId: 'V003',
      vehicleName: 'Truck 103 - Peterbilt 579',
      driverId: 'D003',
      driverName: 'Mike Johnson',
      odometerReading: 78500,
      fuelAmount: 145.2,
      costPerLiter: 1.25,
      totalCost: 181.50,
      location: 'Chevron, Main St.',
      fuelCardNumber: '**** 5678',
      receiptImage: 'receipt_2.jpg',
      efficiency: 9.1
    },
    {
      id: '3',
      date: '2023-11-18',
      vehicleId: 'V002',
      vehicleName: 'Truck 102 - Freightliner Cascadia',
      driverId: 'D002',
      driverName: 'Jane Smith',
      odometerReading: 92300,
      fuelAmount: 110.8,
      costPerLiter: 1.25,
      totalCost: 138.50,
      location: 'BP Station, Route 66',
      efficiency: 7.9
    },
    {
      id: '4',
      date: '2023-11-17',
      vehicleId: 'V004',
      vehicleName: 'Truck 104 - Volvo VNL',
      driverId: 'D004',
      driverName: 'Sarah Williams',
      odometerReading: 56800,
      fuelAmount: 135.3,
      costPerLiter: 1.25,
      totalCost: 169.13,
      location: 'Exxon, Interstate 80',
      fuelCardNumber: '**** 9012',
      receiptImage: 'receipt_4.jpg',
      notes: 'Full tank before long trip',
      efficiency: 8.5
    }
  ];

  const vehicles = [
    { id: 'V001', name: 'Truck 101 - Kenworth T680' },
    { id: 'V002', name: 'Truck 102 - Freightliner Cascadia' },
    { id: 'V003', name: 'Truck 103 - Peterbilt 579' },
    { id: 'V004', name: 'Truck 104 - Volvo VNL' }
  ];

  const drivers = [
    { id: 'D001', name: 'John Doe' },
    { id: 'D002', name: 'Jane Smith' },
    { id: 'D003', name: 'Mike Johnson' },
    { id: 'D004', name: 'Sarah Williams' }
  ];

  const getEfficiencyTag = (efficiency: number) => {
    if (efficiency < 8.0) {
      return <Tag color="green">Excellent</Tag>;
    } else if (efficiency < 9.0) {
      return <Tag color="blue">Good</Tag>;
    } else {
      return <Tag color="orange">Moderate</Tag>;
    }
  };

  const handleViewLog = (id: string) => {
    // Navigate to view details
    navigate(`/diesel/fuel-logs/${id}`);
  };

  const handleEditLog = (id: string) => {
    // Navigate to edit form
    navigate(`/diesel/fuel-logs/edit/${id}`);
  };

  const handleDeleteLog = (id: string) => {
    // Handle deletion (would show confirmation dialog first in a real app)
    console.log(`Delete log ${id}`);
  };

  const handleExportExcel = () => {
    // Export to Excel functionality
    console.log('Export to Excel');
  };

  const handleExportPDF = () => {
    // Export to PDF functionality
    console.log('Export to PDF');
  };

  // Filter the logs based on search text and selections
  const filteredLogs = mockFuelLogs.filter(log => {
    const matchesSearch = 
      log.vehicleName.toLowerCase().includes(searchText.toLowerCase()) ||
      log.driverName.toLowerCase().includes(searchText.toLowerCase()) ||
      log.location.toLowerCase().includes(searchText.toLowerCase()) ||
      (log.notes && log.notes.toLowerCase().includes(searchText.toLowerCase()));
      
    const matchesVehicle = selectedVehicle ? log.vehicleId === selectedVehicle : true;
    const matchesDriver = selectedDriver ? log.driverId === selectedDriver : true;
    
    return matchesSearch && matchesVehicle && matchesDriver;
  });

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: FuelLog, b: FuelLog) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'Vehicle',
      dataIndex: 'vehicleName',
      key: 'vehicleName',
      sorter: (a: FuelLog, b: FuelLog) => a.vehicleName.localeCompare(b.vehicleName),
    },
    {
      title: 'Driver',
      dataIndex: 'driverName',
      key: 'driverName',
      sorter: (a: FuelLog, b: FuelLog) => a.driverName.localeCompare(b.driverName),
    },
    {
      title: 'Odometer',
      dataIndex: 'odometerReading',
      key: 'odometerReading',
      render: (text: number) => `${text.toLocaleString()} km`,
      sorter: (a: FuelLog, b: FuelLog) => a.odometerReading - b.odometerReading,
    },
    {
      title: 'Fuel (L)',
      dataIndex: 'fuelAmount',
      key: 'fuelAmount',
      render: (text: number) => `${text.toFixed(1)} L`,
      sorter: (a: FuelLog, b: FuelLog) => a.fuelAmount - b.fuelAmount,
    },
    {
      title: 'Cost',
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (text: number) => `$${text.toFixed(2)}`,
      sorter: (a: FuelLog, b: FuelLog) => a.totalCost - b.totalCost,
    },
    {
      title: 'Efficiency',
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (text: number) => (
        <Space>
          {text.toFixed(1)} L/100km
          {getEfficiencyTag(text)}
        </Space>
      ),
      sorter: (a: FuelLog, b: FuelLog) => a.efficiency - b.efficiency,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: FuelLog) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => handleViewLog(record.id)}
              type="link"
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              icon={<EditOutlined />} 
              onClick={() => handleEditLog(record.id)}
              type="link"
              size="small"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteLog(record.id)}
              type="link"
              danger
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="fuel-logs-page">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Title level={4}>Fuel Logs</Title>
          <Space>
            <Button 
              type="primary" 
              onClick={() => navigate('/diesel/add-fuel-entry')}
            >
              Add New Entry
            </Button>
          </Space>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <Space size="middle" style={{ display: 'flex', flexWrap: 'wrap' }}>
            <Input 
              placeholder="Search logs..." 
              prefix={<SearchOutlined />} 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            
            <Select
              placeholder="Filter by Vehicle"
              style={{ width: 200 }}
              allowClear
              value={selectedVehicle || undefined}
              onChange={(value) => setSelectedVehicle(value || '')}
            >
              {vehicles.map(vehicle => (
                <Option key={vehicle.id} value={vehicle.id}>{vehicle.name}</Option>
              ))}
            </Select>
            
            <Select
              placeholder="Filter by Driver"
              style={{ width: 200 }}
              allowClear
              value={selectedDriver || undefined}
              onChange={(value) => setSelectedDriver(value || '')}
            >
              {drivers.map(driver => (
                <Option key={driver.id} value={driver.id}>{driver.name}</Option>
              ))}
            </Select>
            
            <RangePicker style={{ width: 240 }} />
            
            <Tooltip title="More Filters">
              <Button icon={<FilterOutlined />} />
            </Tooltip>
          </Space>
        </div>
        
        <Divider />
        
        <Table 
          dataSource={filteredLogs} 
          columns={columns} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          summary={(pageData) => {
            const totalAmount = pageData.reduce((sum, log) => sum + log.fuelAmount, 0);
            const totalCost = pageData.reduce((sum, log) => sum + log.totalCost, 0);
            const avgEfficiency = pageData.length > 0 
              ? pageData.reduce((sum, log) => sum + log.efficiency, 0) / pageData.length 
              : 0;
            
            return (
              <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4}><Text strong>Total/Average:</Text></Table.Summary.Cell>
                  <Table.Summary.Cell index={4}><Text strong>{totalAmount.toFixed(1)} L</Text></Table.Summary.Cell>
                  <Table.Summary.Cell index={5}><Text strong>${totalCost.toFixed(2)}</Text></Table.Summary.Cell>
                  <Table.Summary.Cell index={6}><Text strong>{avgEfficiency.toFixed(1)} L/100km</Text></Table.Summary.Cell>
                  <Table.Summary.Cell index={7} colSpan={2} />
                </Table.Summary.Row>
            );
          }}
        />
        
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <Button 
              icon={<FileExcelOutlined />} 
              onClick={handleExportExcel}
            >
              Export to Excel
            </Button>
            <Button 
              icon={<FilePdfOutlined />} 
              onClick={handleExportPDF}
            >
              Export to PDF
            </Button>
            <Button 
              icon={<DownloadOutlined />} 
            >
              Download All
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default FuelLogs;
