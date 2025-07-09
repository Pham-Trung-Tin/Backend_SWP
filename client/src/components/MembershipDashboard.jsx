import React, { useEffect, useState } from 'react';
import { useMembership } from '../context/MembershipContext';
import { useAuth } from '../context/AuthContext';
import { Container, Card, Button, Alert, Spinner, Table, Badge } from 'react-bootstrap';
import { FaCrown, FaGem, FaCalendarCheck, FaHistory } from 'react-icons/fa';
import { formatCurrency } from '../utils/formatters';

// Component hiển thị thông tin gói thành viên
const MembershipDashboard = () => {
  const { 
    currentMembership, 
    membershipTiers, 
    currentPackage,
    membershipHistory,
    loading, 
    error, 
    fetchMembershipHistory,
    purchasePackage
  } = useMembership();
  
  const { user } = useAuth();
  const [showHistory, setShowHistory] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  
  useEffect(() => {
    // Làm mới trạng thái mua gói khi component mount
    setPurchaseLoading(false);
    setPurchaseError(null);
    setPurchaseSuccess(false);
  }, []);
  
  // Xử lý hiển thị lịch sử gói
  const handleShowHistory = () => {
    setShowHistory(true);
    fetchMembershipHistory();
  };
  
  // Xử lý mua gói
  const handlePurchase = async (packageId, packageName) => {
    setPurchaseLoading(true);
    setPurchaseError(null);
    setPurchaseSuccess(false);
    setSelectedPackage(packageName);
    
    try {
      // Giả định là sử dụng phương thức thanh toán momo
      const result = await purchasePackage(packageId, 'momo');
      
      if (result.success) {
        setPurchaseSuccess(true);
      } else {
        setPurchaseError(result.error || 'Có lỗi xảy ra khi mua gói');
      }
    } catch (err) {
      setPurchaseError(err.message || 'Có lỗi xảy ra khi mua gói');
    } finally {
      setPurchaseLoading(false);
    }
  };
  
  // Render loading spinner nếu đang tải
  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
        <p>Đang tải thông tin gói thành viên...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Quản lý Gói Thành viên</h2>
      
      {error && (
        <Alert variant="danger">{error}</Alert>
      )}
      
      {purchaseError && (
        <Alert variant="danger" dismissible onClose={() => setPurchaseError(null)}>
          Không thể mua gói {selectedPackage}: {purchaseError}
        </Alert>
      )}
      
      {purchaseSuccess && (
        <Alert variant="success" dismissible onClose={() => setPurchaseSuccess(false)}>
          Mua gói {selectedPackage} thành công!
        </Alert>
      )}
      
      {/* Hiển thị gói hiện tại */}
      <Card className="mb-4 border-primary">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">
            {currentMembership === 'premium' ? (
              <><FaCrown className="me-2" /> Gói Premium</>
            ) : currentMembership === 'pro' ? (
              <><FaGem className="me-2" /> Gói Professional</>
            ) : (
              <>Gói Miễn phí</>
            )}
          </h4>
        </Card.Header>
        <Card.Body>
          {currentPackage ? (
            <>
              <h5>Thông tin gói hiện tại</h5>
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Tên gói:</strong> {currentPackage.package_name || currentPackage.packageName}</p>
                  <p><strong>Trạng thái:</strong> {currentPackage.status === 'active' ? 
                    <Badge bg="success">Đang hoạt động</Badge> : 
                    <Badge bg="secondary">Không hoạt động</Badge>}
                  </p>
                </div>
                <div className="col-md-6">
                  <p><strong>Ngày bắt đầu:</strong> {new Date(currentPackage.start_date || currentPackage.startDate).toLocaleDateString()}</p>
                  <p><strong>Ngày kết thúc:</strong> {currentPackage.end_date || currentPackage.endDate ? 
                    new Date(currentPackage.end_date || currentPackage.endDate).toLocaleDateString() : 
                    'Không giới hạn'}
                  </p>
                </div>
              </div>
              {currentMembership !== 'free' && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <p className="mb-0"><strong>Giá:</strong> {formatCurrency(currentPackage.price)}</p>
                    <small className="text-muted">Phương thức thanh toán: {currentPackage.payment_method || currentPackage.paymentMethod}</small>
                  </div>
                  <Button variant="outline-primary" size="sm" onClick={handleShowHistory}>
                    <FaHistory className="me-1" /> Xem lịch sử
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              <p>Bạn đang sử dụng gói <strong>{membershipTiers[currentMembership].name}</strong>.</p>
              <p>Nâng cấp ngay để trải nghiệm đầy đủ tính năng!</p>
            </>
          )}
        </Card.Body>
      </Card>
      
      {/* Hiển thị các gói có sẵn để nâng cấp */}
      <h4 className="mb-3">Các gói thành viên</h4>
      <div className="row">
        {Object.entries(membershipTiers).map(([key, tier]) => (
          <div className="col-md-4 mb-4" key={key}>
            <Card className={`h-100 ${currentMembership === key ? 'border-success' : ''}`}>
              <Card.Header className={`${currentMembership === key ? 'bg-success text-white' : ''}`}>
                <h5 className="mb-0">{tier.icon} {tier.name}</h5>
              </Card.Header>
              <Card.Body>
                <Card.Title className="mb-3 text-primary">{formatCurrency(tier.price)}</Card.Title>
                <Card.Text>{tier.description}</Card.Text>
                <ul className="list-unstyled">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="mb-2">✓ {feature}</li>
                  ))}
                </ul>
              </Card.Body>
              <Card.Footer>
                {currentMembership === key ? (
                  <Button variant="success" disabled>Đang sử dụng</Button>
                ) : (
                  <Button 
                    variant={key === 'premium' ? 'primary' : key === 'pro' ? 'info' : 'outline-secondary'} 
                    disabled={
                      purchaseLoading || 
                      (currentMembership === 'premium' && key === 'free') || 
                      (currentMembership === 'pro')
                    }
                    onClick={() => {
                      if (key === 'premium') handlePurchase(2, 'Premium');
                      if (key === 'pro') handlePurchase(3, 'Professional');
                    }}
                  >
                    {purchaseLoading && selectedPackage === tier.name ? (
                      <><Spinner as="span" animation="border" size="sm" /> Đang xử lý...</>
                    ) : (
                      <>Chọn gói này</>
                    )}
                  </Button>
                )}
              </Card.Footer>
            </Card>
          </div>
        ))}
      </div>
      
      {/* Hiển thị lịch sử gói nếu người dùng yêu cầu */}
      {showHistory && (
        <div className="mt-5">
          <h4 className="mb-3"><FaHistory className="me-2" /> Lịch sử gói thành viên</h4>
          {loading ? (
            <div className="text-center py-3">
              <Spinner animation="border" role="status" />
              <p>Đang tải lịch sử...</p>
            </div>
          ) : membershipHistory && membershipHistory.length > 0 ? (
            <Table responsive striped>
              <thead>
                <tr>
                  <th>Gói</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày kết thúc</th>
                  <th>Trạng thái</th>
                  <th>Phương thức thanh toán</th>
                </tr>
              </thead>
              <tbody>
                {membershipHistory.map((item, index) => (
                  <tr key={index}>
                    <td>{item.package_name}</td>
                    <td>{new Date(item.start_date).toLocaleDateString()}</td>
                    <td>{item.end_date ? new Date(item.end_date).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <Badge bg={item.status === 'active' ? 'success' : 
                        item.status === 'cancelled' ? 'warning' : 'secondary'}>
                        {item.status === 'active' ? 'Đang hoạt động' : 
                         item.status === 'cancelled' ? 'Đã hủy' : 
                         item.status === 'expired' ? 'Đã hết hạn' : item.status}
                      </Badge>
                    </td>
                    <td>{item.payment_method || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info">Không có lịch sử gói thành viên</Alert>
          )}
          <Button 
            variant="secondary" 
            onClick={() => setShowHistory(false)} 
            className="mt-3"
          >
            Ẩn lịch sử
          </Button>
        </div>
      )}
      
      {/* Thông tin các đặc quyền */}
      {currentMembership !== 'free' && (
        <div className="mt-5">
          <h4 className="mb-3">Đặc quyền thành viên {membershipTiers[currentMembership].name}</h4>
          <Card>
            <Card.Body>
              <div className="row">
                <div className="col-md-6">
                  <h5><FaCalendarCheck className="me-2" /> Đặt lịch với Coach</h5>
                  <p>Bạn có thể đặt lịch tư vấn với các Coach chuyên nghiệp!</p>
                  <Button variant="outline-primary" href="/appointments">Đặt lịch ngay</Button>
                </div>
                <div className="col-md-6">
                  <h5>Các đặc quyền khác</h5>
                  <ul>
                    {membershipTiers[currentMembership].features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </Container>
  );
};

export default MembershipDashboard;
