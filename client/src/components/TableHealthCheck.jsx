import React, { useState, useEffect } from 'react';
import { Card, Alert, Button, Table, Tag, Spin, Typography, Space } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';
import healthService from '../services/healthService';
import './TableHealthCheck.css';

const { Title, Text } = Typography;

/**
 * Component hiển thị thông tin và trạng thái của bảng daily_progress
 */
const TableHealthCheck = () => {
  const [loading, setLoading] = useState(true);
  const [tableStatus, setTableStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkTableStructure();
  }, []);

  const checkTableStructure = async () => {
    try {
      setLoading(true);
      const result = await healthService.validateProgressTable();
      setTableStatus(result);
      setLoading(false);
    } catch (err) {
      console.error('Lỗi khi kiểm tra cấu trúc bảng:', err);
      setError('Không thể kiểm tra cấu trúc bảng. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="table-check-card">
        <div className="table-check-loading">
          <Spin tip="Đang kiểm tra cấu trúc bảng..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="table-check-card">
        <Alert
          message="Lỗi kiểm tra"
          description={error}
          type="error"
          showIcon
        />
        <Button 
          type="primary" 
          onClick={checkTableStructure} 
          style={{ marginTop: '16px' }}
        >
          Thử lại
        </Button>
      </Card>
    );
  }

  const isValid = tableStatus?.valid || tableStatus?.status === 'valid';
  const missingColumns = tableStatus?.missingColumns || [];
  const columns = tableStatus?.columns || [];

  return (
    <Card
      className="table-check-card"
      title={
        <Space>
          {isValid ? (
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
          ) : (
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          )}
          <Title level={4} style={{ margin: 0 }}>
            Kiểm tra bảng Daily Progress
          </Title>
        </Space>
      }
    >
      <Alert
        message={
          isValid
            ? 'Cấu trúc bảng đã phù hợp'
            : 'Cấu trúc bảng cần được cập nhật'
        }
        description={
          isValid
            ? 'Bảng daily_progress đã có đầy đủ các cột cần thiết để lưu trữ dữ liệu sức khỏe.'
            : 'Bảng daily_progress cần được cập nhật để hỗ trợ đầy đủ các tính năng theo dõi sức khỏe.'
        }
        type={isValid ? 'success' : 'warning'}
        showIcon
        style={{ marginBottom: '16px' }}
      />

      {!isValid && (
        <div className="missing-columns">
          <Text strong>Các cột cần bổ sung:</Text>
          <div className="column-tags">
            {missingColumns.map((col) => (
              <Tag key={col} color="orange">
                {col}
              </Tag>
            ))}
          </div>
          <Button
            type="primary"
            icon={<SyncOutlined />}
            onClick={checkTableStructure}
            style={{ marginTop: '16px' }}
          >
            Cập nhật cấu trúc bảng
          </Button>
        </div>
      )}

      {columns.length > 0 && (
        <div className="existing-columns">
          <Title level={5}>Cấu trúc bảng hiện tại:</Title>
          <div className="column-tags">
            {columns.map((col) => (
              <Tag key={col} color="blue">
                {col}
              </Tag>
            ))}
          </div>
        </div>
      )}

      <div className="table-info">
        <Text type="secondary">
          * Bảng daily_progress được sử dụng để lưu trữ dữ liệu tiến trình cai thuốc và các chỉ số sức khỏe liên quan.
        </Text>
      </div>
    </Card>
  );
};

export default TableHealthCheck;
