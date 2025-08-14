import React, { useState } from 'react';
import { 
  Layout, 
  Typography, 
  Card, 
  Row, 
  Col, 
  Tabs, 
  Space,
  Button,
  Statistic
} from 'antd';
import { 
  DashboardOutlined, 
  PlusCircleOutlined,
  UserOutlined, 
  TeamOutlined, 
  BarChartOutlined,
  TrophyOutlined,
  EnvironmentOutlined,
  LineChartOutlined,
  ContactsOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { TabPane } = Tabs;

const ClientManagementPage: React.FC = () => {
  const [, setActiveTab] = useState<string>('1');
  const navigate = useNavigate();

  // These would come from context or API in a real app
  const clientStats = {
    totalClients: 48,
    activeClients: 42,
    monthlyRevenue: 185000,
    retentionRate: 94.2,
    newClientsThisMonth: 3,
    averageContractValue: 12500
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const navigateTo = (path: string) => {
    navigate(path);
  };

  return (
    <Layout className="client-management-page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <Title level={2}>Client Management</Title>
        <p>Manage your client relationships, contracts, and business development</p>
      </div>

      <Row gutter={[16, 16]} className="stat-cards">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="Total Clients" 
              value={clientStats.totalClients} 
              precision={0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="Active Clients" 
              value={clientStats.activeClients} 
              precision={0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="Monthly Revenue" 
              value={clientStats.monthlyRevenue} 
              prefix="$"
              precision={0}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="Retention Rate" 
              value={clientStats.retentionRate} 
              suffix="%"
              precision={1}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: '24px' }}>
        <Tabs defaultActiveKey="1" onChange={handleTabChange}>
          <TabPane 
            tab={<span><DashboardOutlined /> Dashboard</span>}
            key="1"
          >
            <div className="tab-content">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Card title="Quick Actions" className="action-card">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button 
                        type="primary" 
                        icon={<PlusCircleOutlined />} 
                        block
                        onClick={() => navigateTo('/clients/add-new-customer')}
                      >
                        Add New Client
                      </Button>
                      <Button 
                        icon={<ContactsOutlined />} 
                        block
                        onClick={() => navigateTo('/clients/active-customers')}
                      >
                        View All Clients
                      </Button>
                      <Button 
                        icon={<BarChartOutlined />} 
                        block
                        onClick={() => navigateTo('/clients/customer-reports')}
                      >
                        Generate Reports
                      </Button>
                    </Space>
                  </Card>
                </Col>
                
                <Col xs={24} md={16}>
                  <Card title="Client Management" className="navigation-card">
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12} md={8}>
                        <Card 
                          hoverable 
                          onClick={() => navigateTo('/clients/active-customers')}
                          className="nav-card"
                        >
                          <div style={{ textAlign: 'center' }}>
                            <TeamOutlined style={{ fontSize: '24px' }} />
                            <p>Active Customers</p>
                            <div className="card-badge">{clientStats.activeClients}</div>
                          </div>
                        </Card>
                      </Col>
                      
                      <Col xs={24} sm={12} md={8}>
                        <Card 
                          hoverable 
                          onClick={() => navigateTo('/clients/customer-reports')}
                          className="nav-card"
                        >
                          <div style={{ textAlign: 'center' }}>
                            <BarChartOutlined style={{ fontSize: '24px' }} />
                            <p>Customer Reports</p>
                          </div>
                        </Card>
                      </Col>
                      
                      <Col xs={24} sm={12} md={8}>
                        <Card 
                          hoverable 
                          onClick={() => navigateTo('/clients/retention-metrics')}
                          className="nav-card"
                        >
                          <div style={{ textAlign: 'center' }}>
                            <TrophyOutlined style={{ fontSize: '24px' }} />
                            <p>Retention Metrics</p>
                          </div>
                        </Card>
                      </Col>
                      
                      <Col xs={24} sm={12} md={8}>
                        <Card 
                          hoverable 
                          onClick={() => navigateTo('/clients/client-network-map')}
                          className="nav-card"
                        >
                          <div style={{ textAlign: 'center' }}>
                            <EnvironmentOutlined style={{ fontSize: '24px' }} />
                            <p>Client Network Map</p>
                          </div>
                        </Card>
                      </Col>
                      
                      <Col xs={24} sm={12} md={8}>
                        <Card 
                          hoverable 
                          onClick={() => navigateTo('/clients/add-new-customer')}
                          className="nav-card"
                        >
                          <div style={{ textAlign: 'center' }}>
                            <PlusCircleOutlined style={{ fontSize: '24px' }} />
                            <p>Add New Customer</p>
                          </div>
                        </Card>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>
          
          <TabPane 
            tab={<span><LineChartOutlined /> Analytics</span>}
            key="2"
          >
            <div className="tab-content">
              <p>Client analytics and performance metrics will appear here.</p>
            </div>
          </TabPane>
          
          <TabPane 
            tab={<span><ContactsOutlined /> Directory</span>}
            key="3"
          >
            <div className="tab-content">
              <p>Client directory and contact management will appear here.</p>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </Layout>
  );
};

export default ClientManagementPage;
