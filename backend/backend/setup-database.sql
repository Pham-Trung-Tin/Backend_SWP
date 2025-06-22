-- Database setup script for Quit Smoking Application
-- Run this in MySQL Workbench or MySQL CLI

-- 1. Tạo database
CREATE DATABASE IF NOT EXISTS SmokingCessationDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 2. Sử dụng database
USE SmokingCessationDB;

-- 3. Bảng Role
CREATE TABLE IF NOT EXISTS Role (
    RoleID INT PRIMARY KEY AUTO_INCREMENT,
    RoleName VARCHAR(50) UNIQUE NOT NULL,
    Description LONGTEXT
);

-- 4. Bảng User
CREATE TABLE IF NOT EXISTS User (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Age INT NULL,
    Gender VARCHAR(10) NULL,
    Phone VARCHAR(20) NULL,
    Address VARCHAR(255) NULL,
    RegisterDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    RoleID INT NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    LastLogin DATETIME NULL,
    ProfileImage VARCHAR(255) NULL,
    Membership VARCHAR(20) DEFAULT 'free',
    FOREIGN KEY (RoleID) REFERENCES Role(RoleID)
);

-- 5. Bảng Package
CREATE TABLE IF NOT EXISTS Package (
    PackageID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Description LONGTEXT,
    Features LONGTEXT,
    Price DECIMAL(10,2) NOT NULL,
    DurationDays INT NOT NULL,
    CreatedByUserID INT,
    IsActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (CreatedByUserID) REFERENCES User(UserID)
);

-- 6. Bảng Membership
CREATE TABLE IF NOT EXISTS Membership (
    MembershipID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    PackageID INT NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'active',
    FOREIGN KEY (UserID) REFERENCES User(UserID),
    FOREIGN KEY (PackageID) REFERENCES Package(PackageID)
);
CREATE INDEX IF NOT EXISTS IDX_Membership_UserID ON Membership(UserID);
CREATE INDEX IF NOT EXISTS IDX_Membership_PackageID ON Membership(PackageID);

-- 7. Bảng Payment
CREATE TABLE IF NOT EXISTS Payment (
    PayID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    PackageID INT NOT NULL,
    PaymentDate DATE DEFAULT (CURRENT_DATE),
    Amount DECIMAL(10,2) NOT NULL,
    PaymentMethod VARCHAR(50) NOT NULL,
    TransactionID VARCHAR(100),
    Status VARCHAR(30) DEFAULT 'Pending',
    FOREIGN KEY (UserID) REFERENCES User(UserID),
    FOREIGN KEY (PackageID) REFERENCES Package(PackageID)
);

-- 8. Bảng QuitSmokingPlan
CREATE TABLE IF NOT EXISTS QuitSmokingPlan (
    PlanID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    Title VARCHAR(100) NOT NULL,
    Reason LONGTEXT,
    StartDate DATE NOT NULL,
    ExpectedQuitDate DATE NOT NULL,
    Description LONGTEXT,
    Status VARCHAR(30) DEFAULT 'In Progress',
    SuccessRate DECIMAL(5,2) DEFAULT 0.00,
    FOREIGN KEY (UserID) REFERENCES User(UserID)
);

-- 9. Bảng PlanStage
CREATE TABLE IF NOT EXISTS PlanStage (
    StageID INT PRIMARY KEY AUTO_INCREMENT,
    PlanID INT NOT NULL,
    StageName VARCHAR(100) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Description LONGTEXT,
    FOREIGN KEY (PlanID) REFERENCES QuitSmokingPlan(PlanID)
);

-- 10. Bảng ProgressTracking
CREATE TABLE IF NOT EXISTS ProgressTracking (
    TrackingID INT PRIMARY KEY AUTO_INCREMENT,
    PlanID INT NOT NULL,
    TrackingDate DATE NOT NULL DEFAULT (CURRENT_DATE),
    Status VARCHAR(50),
    Note LONGTEXT,
    CravingLevel INT,
    CONSTRAINT CHK_CravingLevel CHECK (CravingLevel BETWEEN 0 AND 10),
    FOREIGN KEY (PlanID) REFERENCES QuitSmokingPlan(PlanID)
);

-- 11. Bảng Achievement
CREATE TABLE IF NOT EXISTS Achievement (
    AchievementID INT PRIMARY KEY AUTO_INCREMENT,
    Title VARCHAR(100) NOT NULL,
    Description LONGTEXT NOT NULL,
    Criteria LONGTEXT NOT NULL,
    CreatedByUserID INT NOT NULL,
    FOREIGN KEY (CreatedByUserID) REFERENCES User(UserID)
);

-- 12. Bảng SmokerAchievement
CREATE TABLE IF NOT EXISTS SmokerAchievement (
    UserID INT,
    AchievementID INT,
    PlanID INT,
    EarnedDate DATE NOT NULL DEFAULT (CURRENT_DATE),
    PRIMARY KEY (UserID, AchievementID),
    FOREIGN KEY (UserID) REFERENCES User(UserID),
    FOREIGN KEY (AchievementID) REFERENCES Achievement(AchievementID),
    FOREIGN KEY (PlanID) REFERENCES QuitSmokingPlan(PlanID)
);

-- 13. Bảng Notification
CREATE TABLE IF NOT EXISTS Notification (
    NotificationID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    Type VARCHAR(50) NOT NULL,
    Content LONGTEXT NOT NULL,
    SentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(20) DEFAULT 'Unread',
    SentByUserID INT,
    FOREIGN KEY (UserID) REFERENCES User(UserID),
    FOREIGN KEY (SentByUserID) REFERENCES User(UserID)
);

-- 14. Bảng Blog
CREATE TABLE IF NOT EXISTS Blog (
    BlogID INT PRIMARY KEY AUTO_INCREMENT,
    Title VARCHAR(200) NOT NULL,
    Content LONGTEXT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    AuthorUserID INT NOT NULL,
    FOREIGN KEY (AuthorUserID) REFERENCES User(UserID)
);

-- 15. Bảng BlogComment
CREATE TABLE IF NOT EXISTS BlogComment (
    CommentID INT PRIMARY KEY AUTO_INCREMENT,
    BlogID INT NOT NULL,
    UserID INT NOT NULL,
    CommentText LONGTEXT NOT NULL,
    CommentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    ParentCommentID INT NULL,
    FOREIGN KEY (BlogID) REFERENCES Blog(BlogID),
    FOREIGN KEY (UserID) REFERENCES User(UserID),
    FOREIGN KEY (ParentCommentID) REFERENCES BlogComment(CommentID)
);

-- 16. Bảng Booking
CREATE TABLE IF NOT EXISTS Booking (
    BookingID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    CoachUserID INT NOT NULL,
    BookingDate DATETIME NOT NULL,
    Status VARCHAR(20) DEFAULT 'Pending',
    ApprovedByUserID INT NULL,
    ApprovedDate DATETIME NULL,
    FOREIGN KEY (UserID) REFERENCES User(UserID),
    FOREIGN KEY (CoachUserID) REFERENCES User(UserID),
    FOREIGN KEY (ApprovedByUserID) REFERENCES User(UserID)
);

-- 17. Bảng Appointment
CREATE TABLE IF NOT EXISTS Appointment (
    AppointmentID INT PRIMARY KEY AUTO_INCREMENT,
    BookingID INT NOT NULL,
    AppointmentDate DATETIME NOT NULL,
    DurationMinutes INT DEFAULT 30,
    Location VARCHAR(255),
    Notes LONGTEXT,
    Status VARCHAR(30) DEFAULT 'Scheduled',
    FOREIGN KEY (BookingID) REFERENCES Booking(BookingID)
);

-- 18. Bảng Feedback
CREATE TABLE IF NOT EXISTS Feedback (
    FeedbackID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    CoachUserID INT NOT NULL,
    Rating INT NOT NULL,
    Comment LONGTEXT,
    FeedbackDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES User(UserID),
    FOREIGN KEY (CoachUserID) REFERENCES User(UserID)
);

-- 19. Bảng Chat / Message
CREATE TABLE IF NOT EXISTS Message (
    MessageID INT PRIMARY KEY AUTO_INCREMENT,
    SenderUserID INT NOT NULL,
    ReceiverUserID INT NOT NULL,
    MessageText LONGTEXT NOT NULL,
    SentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    IsRead BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (SenderUserID) REFERENCES User(UserID),
    FOREIGN KEY (ReceiverUserID) REFERENCES User(UserID)
);

-- Thêm vai trò (chỉ thêm nếu chưa có)
INSERT IGNORE INTO Role (RoleName, Description) VALUES 
('Admin', 'Quản trị hệ thống'), 
('Coach', 'Huấn luyện viên cai thuốc'), 
('Smoker', 'Người dùng cần cai thuốc');

-- Thêm người dùng (chỉ thêm nếu chưa có)
INSERT IGNORE INTO User (Name, Email, Password, RoleID, Membership) VALUES 
('Admin User', 'admin@nosmoke.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 'pro'),
('Coach Nguyễn', 'coach1@nosmoke.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 'pro'),
('User Free', 'free@nosmoke.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 'free');

-- Thêm một số sample data
INSERT IGNORE INTO Package (Name, Description, Features, Price, DurationDays, CreatedByUserID, IsActive) VALUES
('Free Plan', 'Gói miễn phí cơ bản', 'Theo dõi cơ bản, blog', 0.00, 365, 1, TRUE),
('Premium Plan', 'Gói premium đầy đủ tính năng', 'Chat với coach, theo dõi chi tiết, báo cáo', 99000.00, 30, 1, TRUE),
('Pro Plan', 'Gói chuyên nghiệp', 'Tất cả tính năng premium + hỗ trợ 24/7', 199000.00, 30, 1, TRUE);

INSERT IGNORE INTO Achievement (Title, Description, Criteria, CreatedByUserID) VALUES
('Ngày đầu tiên', 'Hoàn thành ngày đầu tiên không hút thuốc', 'Không hút thuốc trong 1 ngày', 1),
('Tuần đầu tiên', 'Hoàn thành tuần đầu tiên không hút thuốc', 'Không hút thuốc trong 7 ngày', 1),
('Một tháng sạch', 'Hoàn thành một tháng không hút thuốc', 'Không hút thuốc trong 30 ngày', 1);

-- Thêm sample blog posts
INSERT IGNORE INTO Blog (Title, Content, AuthorUserID) VALUES
('10 Tips cai thuốc hiệu quả', 'Đây là những tips giúp bạn cai thuốc thành công: 1. Xác định động lực...', 2),
('Tác hại của thuốc lá đến sức khỏe', 'Thuốc lá gây ra nhiều tác hại nghiêm trọng đến sức khỏe...', 2),
('Cách vượt qua cơn thèm thuốc', 'Khi có cơn thèm thuốc, bạn có thể áp dụng những cách sau...', 1);

SELECT 'Database setup completed successfully!' as Status;
