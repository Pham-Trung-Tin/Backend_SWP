import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Alert, 
  Tabs, 
  Space, 
  Typography, 
  Divider 
} from 'antd';
import { 
  DatabaseOutlined, 
  ToolOutlined, 
  CheckCircleOutlined,
  RocketOutlined
} from '@ant-design/icons';
import TableHealthCheck from '../components/TableHealthCheck';
import './Admin.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export default function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('1');

  if (!user || !user.is_admin) {
    return (
      <div className="admin-container">
        <Card>
          <Alert
            message="Quyền truy cập bị từ chối"
            description="Bạn cần có quyền quản trị để truy cập trang này."
            type="error"
            showIcon
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <Title level={2}>
          <Space>
            <ToolOutlined />
            Trang Quản trị Hệ thống
          </Space>
        </Title>
        <Paragraph>
          Quản lý cơ sở dữ liệu, cấu hình và cài đặt hệ thống cho ứng dụng NoSmoke.
        </Paragraph>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        type="card"
        className="admin-tabs"
      >
        <TabPane 
          tab={
            <span>
              <DatabaseOutlined />
              Cấu trúc Database
            </span>
          } 
          key="1"
        >
          <div className="tab-content">
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Card title="Kiểm tra cấu trúc bảng" className="db-check-card">
                  <Paragraph>
                    Hệ thống sẽ kiểm tra cấu trúc các bảng trong cơ sở dữ liệu và đảm bảo rằng chúng có đủ các cột cần thiết để hỗ trợ tất cả các tính năng.
                  </Paragraph>
                </Card>
              </Col>
              
              <Col xs={24}>
                <TableHealthCheck />
              </Col>
            </Row>
          </div>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <RocketOutlined />
              Hiệu suất hệ thống
            </span>
          } 
          key="2"
        >
          <div className="tab-content">
            <Card className="system-status-card">
              <div className="status-header">
                <Title level={4}>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    Hệ thống đang hoạt động bình thường
                  </Space>
                </Title>
              </div>
              
              <Divider />
              
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Card className="stat-card">
                    <div className="stat-title">CPU Load</div>
                    <div className="stat-value">23%</div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card className="stat-card">
                    <div className="stat-title">Memory Usage</div>
                    <div className="stat-value">512MB</div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card className="stat-card">
                    <div className="stat-title">Disk Space</div>
                    <div className="stat-value">2.1GB</div>
                  </Card>
                </Col>
              </Row>
            </Card>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
}
