import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Home from '../page/Home';
import Tools from '../page/Tools';
import MembershipPackage from '../page/MembershipPackage';
import SettingsPage from '../page/Settings';
import Pay from '../page/Pay';
import PaymentSuccess from '../page/PaymentSuccess';

/**
 * AppRoutes - Cung cấp cấu hình định tuyến (routing) cho toàn bộ ứng dụng
 * 
 * Component này định nghĩa các routes chính sử dụng React Router v7
 * và liên kết chúng với các component tương ứng.
 */

// Layout component để bọc nội dung của trang
const Layout = ({ children }) => (
  <>
    {children}
  </>
);

// Cấu hình router
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout><Home /></Layout>,
  },
  {
    path: "/home",
    loader: () => { return window.location.replace('/') },
  },  {
    path: "/tools",
    element: <Layout><Tools /></Layout>,
  }, {
   path: "/settings",
    element: <Layout><SettingsPage /></Layout>,
  },  {
    path: "/membership",
    element: <Layout><MembershipPackage /></Layout>,
  },  {
    path: "/payment",
    element: <Layout><Pay /></Layout>,
  },
  {
    path: "*",
    loader: () => { return window.location.replace('/') },
  }
]);

export default router;