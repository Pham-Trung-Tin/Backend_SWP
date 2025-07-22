-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    membership_type ENUM('free', 'premium', 'pro') NOT NULL,
    description TEXT,
    period ENUM('tháng', 'năm') NOT NULL DEFAULT 'tháng',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create package_features table
CREATE TABLE IF NOT EXISTS package_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

-- Insert default packages
INSERT INTO packages (id, name, price, membership_type, description, period) VALUES
(1, 'Free', 0, 'free', 'Bắt đầu miễn phí', 'tháng'),
(2, 'Premium', 99000, 'premium', 'Hỗ trợ toàn diện', 'tháng'),
(3, 'Pro', 999000, 'pro', 'Hỗ trợ toàn diện', 'năm');

-- Insert features for Free package
INSERT INTO package_features (package_id, feature_name, enabled) VALUES
(1, 'Theo dõi cai thuốc', TRUE),
(1, 'Lập kế hoạch cá nhân', TRUE),
(1, 'Huy hiệu & cộng đồng', FALSE),
(1, 'Chat huấn luyện viên', FALSE),
(1, 'Video call tư vấn', FALSE);

-- Insert features for Premium package
INSERT INTO package_features (package_id, feature_name, enabled) VALUES
(2, 'Theo dõi cai thuốc', TRUE),
(2, 'Lập kế hoạch cá nhân', TRUE),
(2, 'Huy hiệu & cộng đồng', TRUE),
(2, 'Chat huấn luyện viên', TRUE),
(2, 'Video call tư vấn', TRUE);

-- Insert features for Pro package
INSERT INTO package_features (package_id, feature_name, enabled) VALUES
(3, 'Theo dõi cai thuốc', TRUE),
(3, 'Lập kế hoạch cá nhân', TRUE),
(3, 'Huy hiệu & cộng đồng', TRUE),
(3, 'Chat huấn luyện viên', TRUE),
(3, 'Video call tư vấn', TRUE); 