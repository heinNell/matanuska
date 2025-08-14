import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Row, 
  Col, 
  Select, 
  Button, 
  Space,
  Tag,
  List,
  Avatar,
  Statistic,
  Divider
} from 'antd';
import {
  EnvironmentOutlined,
  FilterOutlined,
  SearchOutlined,
  TeamOutlined,
  DollarOutlined,
  LineChartOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface ClientLocation {
  id: string;
  companyName: string;
  contactPerson: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  contractValue: number;
  clientType: string;
  industry: string;
  status: 'active' | 'inactive' | 'prospect';
}

const ClientNetworkMap: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');

  // Mock data for client locations
  const clientLocations: ClientLocation[] = [
    {
      id: '1',
      companyName: 'Acme Logistics',
      contactPerson: 'John Smith',
      address: '123 Business Ave',
      city: 'Las Vegas',
      state: 'Nevada',
      lat: 36.1699,
      lng: -115.1398,
      contractValue: 125000,
      clientType: 'Enterprise',
      industry: 'Manufacturing',
      status: 'active'
    },
    {
      id: '2',
      companyName: 'Pacific Distribution',
      contactPerson: 'Sarah Johnson',
      address: '456 Commerce St',
      city: 'Los Angeles',
      state: 'California',
      lat: 34.0522,
      lng: -118.2437,
      contractValue: 85000,
      clientType: 'Medium Business',
      industry: 'Retail',
      status: 'active'
    },
    {
      id: '3',
      companyName: 'Mountain Supply Co',
      contactPerson: 'Mike Davis',
      address: '789 Industrial Blvd',
      city: 'Denver',
      state: 'Colorado',
      lat: 39.7392,
      lng: -104.9903,
      contractValue: 65000,
      clientType: 'Small Business',
      industry: 'Construction',
      status: 'active'
    },
    {
      id: '4',
      companyName: 'Desert Retail Group',
      contactPerson: 'Lisa Wilson',
      address: '321 Market Plaza',
      city: 'Phoenix',
      state: 'Arizona',
      lat: 33.4484,
      lng: -112.0740,
      contractValue: 95000,
      clientType: 'Medium Business',
      industry: 'Retail',
      status: 'prospect'
    },
    {
      id: '5',
      companyName: 'Tech Solutions Inc',
      contactPerson: 'David Brown',
      address: '555 Tech Park Dr',
      city: 'Austin',
      state: 'Texas',
      lat: 30.2672,
      lng: -97.7431,
      contractValue: 150000,
      clientType: 'Enterprise',
      industry: 'Technology',
      status: 'active'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      case 'prospect':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getClientTypeColor = (type: string) => {
    switch (type) {
      case 'Enterprise':
        return 'purple';
      case 'Medium Business':
        return 'orange';
      case 'Small Business':
        return 'blue';
      default:
        return 'default';
    }
  };

  const filteredClients = clientLocations.filter(client => {
    const matchesFilter = selectedFilter === 'all' || client.status === selectedFilter;
    const matchesState = selectedState === 'all' || client.state === selectedState;
    return matchesFilter && matchesState;
  });

  // Calculate statistics
  const totalValue = filteredClients.reduce((sum, client) => sum + client.contractValue, 0);
  const activeClients = filteredClients.filter(client => client.status === 'active').length;
  const prospects = filteredClients.filter(client => client.status === 'prospect').length;

  // Get unique states for filter
  const states = [...new Set(clientLocations.map(client => client.state))];

  return (
    <div className="client-network-map-page">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Title level={3}>
              <EnvironmentOutlined style={{ marginRight: '8px' }} />
              Client Network Map
            </Title>
            <Text type="secondary">
              Visualize your client network and geographic distribution
            </Text>
          </div>
          <Space>
            <Button icon={<SearchOutlined />}>Search Clients</Button>
            <Button type="primary">Add Client</Button>
          </Space>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Clients"
                value={filteredClients.length}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Active Clients"
                value={activeClients}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Prospects"
                value={prospects}
                prefix={<LineChartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Value"
                value={totalValue}
                prefix={<DollarOutlined />}
                precision={0}
                formatter={value => `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <Card title="Filters" extra={<FilterOutlined />}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Status:</Text>
                  <Select 
                    value={selectedFilter} 
                    onChange={setSelectedFilter}
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    <Option value="all">All Statuses</Option>
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                    <Option value="prospect">Prospects</Option>
                  </Select>
                </div>
                
                <div>
                  <Text strong>State:</Text>
                  <Select 
                    value={selectedState} 
                    onChange={setSelectedState}
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    <Option value="all">All States</Option>
                    {states.map(state => (
                      <Option key={state} value={state}>{state}</Option>
                    ))}
                  </Select>
                </div>
              </Space>
            </Card>

            <Card title="Geographic Distribution" style={{ marginTop: '16px' }}>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <EnvironmentOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                <div style={{ marginTop: '16px' }}>
                  <Text type="secondary">Interactive map will be displayed here</Text>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <Text type="secondary">Showing {filteredClients.length} client locations</Text>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card title="Client Directory" extra={<Text type="secondary">{filteredClients.length} clients</Text>}>
              <List
                itemLayout="horizontal"
                dataSource={filteredClients}
                pagination={{ pageSize: 6 }}
                renderItem={(client) => (
                  <List.Item
                    actions={[
                      <Button type="link" size="small">View Details</Button>,
                      <Button type="link" size="small">Contact</Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          style={{ 
                            backgroundColor: getStatusColor(client.status) === 'green' ? '#52c41a' : 
                                           getStatusColor(client.status) === 'blue' ? '#1890ff' : '#ff4d4f'
                          }}
                        >
                          {client.companyName.charAt(0)}
                        </Avatar>
                      }
                      title={
                        <Space>
                          {client.companyName}
                          <Tag color={getStatusColor(client.status)}>
                            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                          </Tag>
                          <Tag color={getClientTypeColor(client.clientType)}>
                            {client.clientType}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small">
                          <Text type="secondary">
                            <UserOutlined /> {client.contactPerson}
                          </Text>
                          <Text type="secondary">
                            <EnvironmentOutlined /> {client.city}, {client.state}
                          </Text>
                          <Text type="secondary">
                            <DollarOutlined /> ${client.contractValue.toLocaleString()} contract value
                          </Text>
                          <Tag color="default">{client.industry}</Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        <Divider orientation="left">Network Insights</Divider>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card title="Top States" type="inner">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>California:</Text>
                  <Text strong>1 client</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Nevada:</Text>
                  <Text strong>1 client</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Colorado:</Text>
                  <Text strong>1 client</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Arizona:</Text>
                  <Text strong>1 client</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Texas:</Text>
                  <Text strong>1 client</Text>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card title="Industry Breakdown" type="inner">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Manufacturing:</Text>
                  <Text strong>1 client</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Retail:</Text>
                  <Text strong>2 clients</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Construction:</Text>
                  <Text strong>1 client</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Technology:</Text>
                  <Text strong>1 client</Text>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card title="Growth Opportunities" type="inner">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>• Focus on Texas market expansion</Text>
                <Text>• Develop retail industry partnerships</Text>
                <Text>• Convert prospects in Arizona</Text>
                <Text>• Strengthen West Coast presence</Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ClientNetworkMap;
