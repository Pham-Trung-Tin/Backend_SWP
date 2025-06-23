import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { pool } from '../config/database.js';

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    // Generate 6-digit verification code
    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }    // Store verification code in database
    async storeVerificationCode(email, code) {
        const expiredAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const query = `
            INSERT INTO email_verifications (email, verification_code, expires_at)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
            verification_code = VALUES(verification_code),
            expires_at = VALUES(expires_at),
            created_at = NOW()
        `;

        await pool.execute(query, [email, code, expiredAt]);
    }    // Verify code
    async verifyCode(email, code) {
        try {
            const trimmedCode = String(code).trim();

            // Kiểm tra mã xác thực hợp lệ
            const query = `
                SELECT * FROM email_verifications 
                WHERE email = ? 
                AND verification_code = ? 
                AND expires_at > NOW()
                ORDER BY created_at DESC
                LIMIT 1
            `;

            const [rows] = await pool.execute(query, [email, trimmedCode]);

            if (rows.length > 0) {
                const record = rows[0];

                if (record.is_used) {
                    // Cho phép dùng lại mã để hoàn tất xác thực
                    await pool.execute(
                        'UPDATE email_verifications SET is_used = TRUE WHERE id = ?',
                        [record.id]
                    );
                    return true;
                } else {
                    // Đánh dấu mã đã được sử dụng
                    await pool.execute(
                        'UPDATE email_verifications SET is_used = TRUE WHERE id = ?',
                        [record.id]
                    );
                    return true;
                }
            }

            // Kiểm tra mã gần nhất nếu không tìm thấy mã hợp lệ
            const [allCodes] = await pool.execute(
                `SELECT * FROM email_verifications 
                WHERE email = ?
                ORDER BY created_at DESC
                LIMIT 3`,
                [email]
            );

            if (allCodes.length > 0) {
                const matchingCode = allCodes.find(record => record.verification_code === trimmedCode);

                if (matchingCode) {
                    const now = new Date();
                    const expiryDate = new Date(matchingCode.expires_at);
                    const isExpired = now > expiryDate;

                    if (!isExpired && !matchingCode.is_used) {
                        await pool.execute(
                            'UPDATE email_verifications SET is_used = TRUE WHERE id = ?',
                            [matchingCode.id]
                        );
                        return true;
                    }
                }
            }

            return false;
        } catch (error) {
            console.error('❌ Code verification error:', error.message);
            return false;
        }
    }

    // Delete verification code after use
    async deleteVerificationCode(email) {
        await pool.execute('DELETE FROM email_verifications WHERE email = ?', [email]);
    }    // Send verification email
    async sendVerificationEmail(email, fullName, code) {
        try {
            // Store verification code in database
            await this.storeVerificationCode(email, code);

            const mailOptions = {
                from: `"NoSmoke App" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Mã xác nhận tài khoản NoSmoke',
                html: this.getVerificationEmailTemplate(fullName, code)
            }; await this.transporter.sendMail(mailOptions);
            console.log(`📧 Verification email sent to ${email}`);

        } catch (error) {
            console.error('❌ Send verification email error:', error.message);
            throw new Error('Failed to send verification email');
        }
    }

    // Send welcome email
    async sendWelcomeEmail(email, fullName) {
        try {
            const mailOptions = {
                from: `"NoSmoke App" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Chào mừng đến với NoSmoke!',
                html: this.getWelcomeEmailTemplate(fullName)
            }; await this.transporter.sendMail(mailOptions);
            console.log(`🎉 Welcome email sent to ${email}`);

        } catch (error) {
            console.error('❌ Send welcome email error:', error.message);
            // Don't throw error for welcome email
        }
    }

    // Send password reset email
    async sendPasswordResetEmail(email, fullName, resetCode) {
        try {
            const mailOptions = {
                from: `"NoSmoke App" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Mã đặt lại mật khẩu NoSmoke',
                html: this.getPasswordResetEmailTemplate(fullName, resetCode)
            }; await this.transporter.sendMail(mailOptions);
            console.log(`🔑 Password reset email sent to ${email}`);

        } catch (error) {
            console.error('❌ Send password reset email error:', error.message);
            throw new Error('Failed to send password reset email');
        }
    }

    // Email template for verification
    getVerificationEmailTemplate(fullName, code) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; background: #f9f9f9; }
                    .code-box { background: #fff; border: 2px dashed #4CAF50; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
                    .code { font-size: 32px; font-weight: bold; color: #4CAF50; letter-spacing: 5px; }
                    .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚭 NoSmoke</h1>
                        <h2>Xác nhận tài khoản</h2>
                    </div>
                    
                    <div class="content">
                        <h3>Xin chào ${fullName}!</h3>
                        <p>Cảm ơn bạn đã đăng ký tài khoản NoSmoke. Vui lòng nhập mã xác nhận bên dưới để hoàn tất đăng ký:</p>
                        
                        <div class="code-box">
                            <p style="margin: 0; font-size: 16px; color: #666;">Mã xác nhận của bạn:</p>
                            <div class="code">${code}</div>
                        </div>
                        
                        <p><strong>Lưu ý:</strong></p>
                        <ul>
                            <li>Mã xác nhận có hiệu lực trong <strong>10 phút</strong></li>
                            <li>Không chia sẻ mã này với bất kỳ ai</li>
                            <li>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email</li>
                        </ul>
                    </div>
                    
                    <div class="footer">
                        <p>&copy; 2025 NoSmoke App. All rights reserved.</p>
                        <p>Email này được gửi tự động, vui lòng không reply.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    // Welcome email template
    getWelcomeEmailTemplate(fullName) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
                    .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; background: #f9f9f9; }
                    .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #4CAF50; }
                    .button { background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                    .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Chào mừng đến với NoSmoke!</h1>
                    </div>
                    
                    <div class="content">
                        <h3>Xin chào ${fullName}!</h3>
                        <p>Chúc mừng bạn đã tạo tài khoản thành công! Bạn đã sẵn sàng bắt đầu hành trình bỏ thuốc lá cùng NoSmoke.</p>
                        
                        <h4>Những gì bạn có thể làm:</h4>
                        
                        <div class="feature">
                            <h4>📊 Theo dõi tiến độ</h4>
                            <p>Ghi lại quá trình bỏ thuốc và xem sự cải thiện hàng ngày</p>
                        </div>
                        
                        <div class="feature">
                            <h4>🎯 Tạo kế hoạch</h4>
                            <p>Xây dựng kế hoạch bỏ thuốc phù hợp với bản thân</p>
                        </div>
                        
                        <div class="feature">
                            <h4>👨‍⚕️ Tư vấn chuyên gia</h4>
                            <p>Đặt lịch hẹn với các coach chuyên nghiệp</p>
                        </div>
                        
                        <div class="feature">
                            <h4>👥 Cộng đồng</h4>
                            <p>Kết nối với những người cùng mục tiêu</p>
                        </div>
                        
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.CLIENT_URL}/login" class="button">Bắt đầu ngay</a>
                        </p>
                        
                        <p>Chúc bạn thành công trên con đường bỏ thuốc lá! 💪</p>
                    </div>
                    
                    <div class="footer">
                        <p>&copy; 2025 NoSmoke App. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    // Password reset email template
    getPasswordResetEmailTemplate(fullName, resetCode) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
                    .header { background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; background: #f9f9f9; }
                    .code-box { background: #fff; border: 2px dashed #f39c12; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
                    .code { font-size: 32px; font-weight: bold; color: #f39c12; letter-spacing: 5px; }
                    .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔑 NoSmoke</h1>
                        <h2>Đặt lại mật khẩu</h2>
                    </div>
                    
                    <div class="content">
                        <h3>Xin chào ${fullName}!</h3>
                        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản NoSmoke của bạn. Vui lòng nhập mã xác nhận bên dưới để tiếp tục:</p>
                        
                        <div class="code-box">
                            <p style="margin: 0; font-size: 16px; color: #666;">Mã đặt lại mật khẩu:</p>
                            <div class="code">${resetCode}</div>
                        </div>
                        
                        <div class="warning">
                            <h4 style="margin-top: 0;">⚠️ Lưu ý quan trọng:</h4>
                            <ul style="margin-bottom: 0;">
                                <li>Mã xác nhận có hiệu lực trong <strong>15 phút</strong></li>
                                <li>Không chia sẻ mã này với bất kỳ ai</li>
                                <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                                <li>Liên hệ với chúng tôi ngay lập tức nếu bạn nghi ngờ tài khoản bị xâm phạm</li>
                            </ul>
                        </div>
                        
                        <p>Sau khi đặt lại mật khẩu thành công, bạn sẽ cần đăng nhập lại với mật khẩu mới.</p>
                    </div>
                    
                    <div class="footer">
                        <p>&copy; 2025 NoSmoke App. All rights reserved.</p>
                        <p>Email này được gửi tự động, vui lòng không reply.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}

export default new EmailService();
