import "./style.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Header from "./components/Header.jsx";
import Nav from "./components/Nav.jsx";
import Footer from "./components/Footer.jsx";
import BackToTop from "./components/BackToTop.jsx";
import Home from "./page/Home.jsx";
import ProfilePage from "./page/Profile.jsx"; // Đổi tên từ Tools sang ProfilePage
import ProgressPage from "./page/Progress.jsx"; // Import component Progress
import Blog from "./page/Blog.jsx"; // Import component Blog
import Login from "./page/Login.jsx"; // Import component Login
import Register from "./page/Register.jsx"; // Import component Register
import ForgotPassword from "./page/ForgotPassword.jsx"; // Import component ForgotPassword
import EmailVerification from "./page/EmailVerification.jsx"; // Import component EmailVerification
import MembershipPackage from "./page/MembershipPackage.jsx"; // Import component MembershipPackage
import BookAppointment from "./page/BookAppointment.jsx"; // Import component BookAppointment
import ProtectedRoute from "./components/ProtectedRoute.jsx"; // Import ProtectedRoute
import AccessDenied from "./page/AccessDenied.jsx"; // Import AccessDenied
import UserProfile from "./page/User.jsx"; // Import UserProfile component
import { AuthProvider } from "./context/AuthContext.jsx"; // Import AuthProvider
import { MembershipProvider } from "./context/MembershipContext.jsx"; // Import MembershipProvider
import "./style.css";
import JourneyStepper from "./components/JourneyStepper.jsx";
import Notification from "./page/Notification.jsx"; // Import component Notification
import SettingsPage from "./page/Settings.jsx"; // Import component Settings
import Pay from "./page/Pay.jsx";
import PaymentSuccess from "./page/PaymentSuccess.jsx";
/**
 * App - Component chính của ứng dụng
 *
 * Component này sử dụng React Router v7 để định tuyến
 * bao gồm Header, Nav, Footer và các route chính.
 */

// Layout component để bọc nội dung của trang
const Layout = ({ children }) => (
  <>
    <Header />
    <Nav />
    <main className="min-h-[calc(100vh-200px)]">{children}</main>
    <Footer />
    <BackToTop />
  </>
);

// Placeholder component cho các trang đang phát triển
const ComingSoon = ({ title }) => (
  <div className="container py-20">
    <h1 className="text-4xl font-bold text-center">{title}</h1>
    <p className="text-center mt-4">Trang này đang được phát triển</p>
  </div>
);

// Cấu hình router sử dụng React Router v7
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
  },
  {
    path: "/home",
    loader: () => {
      return window.location.replace("/");
    },
  },
  {
    path: "/user",
    element: (
      <Layout>
        <ProtectedRoute>
          <UserProfile isStandalone={true} />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/profile",
    element: (
      <Layout>
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/progress",
    element: (
      <Layout>
        <ProtectedRoute>
          <ProgressPage />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/about",
    element: (
      <Layout>
        <ComingSoon title="Về chúng tôi" />
      </Layout>
    ),
  },
  {
    path: "/journey",
    element: (
      <Layout>
        <JourneyStepper />
      </Layout>
    ), // Sử dụng JourneyStepper cho trang Công Cụ
  },
  {
    path: "/blog",
    element: (
      <Layout>
        <Blog />
      </Layout>
    ),
  },
  {
    path: "/testimonials",
    element: (
      <Layout>
        <ComingSoon title="Câu chuyện thành công" />
      </Layout>
    ),
  },
  {
    path: "/contact",
    element: (
      <Layout>
        <ComingSoon title="Liên hệ" />
      </Layout>
    ),
  },
  {
    path: "/support",
    element: (
      <Layout>
        <ComingSoon title="Hỗ trợ" />
      </Layout>
    ),
  },
  {
    path: "/team",
    element: (
      <Layout>
        <ComingSoon title="Đội ngũ" />
      </Layout>
    ),
  },
  {
    path: "/partners",
    element: (
      <Layout>
        <ComingSoon title="Đối tác" />
      </Layout>
    ),
  },
  {
    path: "/community",
    element: (
      <Layout>
        <ComingSoon title="Cộng đồng hỗ trợ" />
      </Layout>
    ),
  },
  {
    path: "/feedback",
    element: (
      <Layout>
        <ComingSoon title="Góp ý" />
      </Layout>
    ),
  },
  {
    path: "/privacy",
    element: (
      <Layout>
        <ComingSoon title="Chính sách bảo mật" />
      </Layout>
    ),
  },
  {
    path: "/terms",
    element: (
      <Layout>
        <ComingSoon title="Điều khoản sử dụng" />
      </Layout>
    ),
  },
  {
    path: "/sitemap",
    element: (
      <Layout>
        <ComingSoon title="Sơ đồ trang" />
      </Layout>
    ),
  },
  {
    path: "/login",
    element: (
      <Layout>
        <Login />
      </Layout>
    ),
  },
  {
    path: "/signup",
    element: (
      <Layout>
        <Register />
      </Layout>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <Layout>
        <ForgotPassword />
      </Layout>
    ),
  },
  {
    path: "/payment",
    element: (
      <Layout>
        <Pay />
      </Layout>
    ),
  },
  {
    path: "/payment/success",
    element: (
      <Layout>
        <PaymentSuccess />
      </Layout>
    ),
  },
  {
    path: "/notifications",
    element: (
      <Layout>
        <Notification />
      </Layout>
    ), // Đường dẫn đến trang thông báo
  },
  {
    path: "/membership",
    element: (
      <Layout>
        <MembershipPackage />
      </Layout>
    ), // Đường dẫn đến trang gói thành viên
  },
  {
    path: "/settings",
    element: (
      <Layout>
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/appointment",
    element: (
      <Layout>
        <ProtectedRoute>
          <BookAppointment />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/feedback",
    element: (
      <Layout>
        <ComingSoon title="Góp ý" />
      </Layout>
    ),
  },
  {
    path: "/privacy",
    element: (
      <Layout>
        <ComingSoon title="Chính sách bảo mật" />
      </Layout>
    ),
  },
  {
    path: "/terms",
    element: (
      <Layout>
        <ComingSoon title="Điều khoản sử dụng" />
      </Layout>
    ),
  },
  {
    path: "/sitemap",
    element: (
      <Layout>
        <ComingSoon title="Sơ đồ trang" />
      </Layout>
    ),
  },
  {
    path: "/login",
    element: (
      <Layout>
        <Login />
      </Layout>
    ),
  },
  {
    path: "/signup",
    element: (
      <Layout>
        <Register />
      </Layout>
    ),
  },
  {
    path: "/settings",
    element: (
      <Layout>
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/access-denied",
    element: (
      <Layout>
        <AccessDenied />
      </Layout>),
  },
  {
    path: "/verify-email",
    element: (
      <Layout>
        <EmailVerification />
      </Layout>
    ),
  },
  {
    path: "*",
    loader: () => {
      return window.location.replace("/");
    },
  },
]);

// Simple BackToTopButton component nếu thành phần kia không hoạt động
const SimpleBackToTop = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      onClick={scrollToTop}
      style={{
        position: "fixed",
        bottom: "30px",
        right: "30px",
        width: "50px",
        height: "50px",
        backgroundColor: "red",
        color: "white",
        borderRadius: "50%",
        border: "none",
        fontSize: "20px",
        cursor: "pointer",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
        zIndex: 9999,
      }}
    >
      ↑
    </button>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MembershipProvider>
        <RouterProvider router={router} />
      </MembershipProvider>
    </AuthProvider>
  );
}
