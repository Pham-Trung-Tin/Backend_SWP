import React, { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Home from '../page/Home';
import Tools from '../page/Tools';
import MembershipPackage from '../page/MembershipPackage';
import SettingsPage from '../page/Settings';
import Pay from '../page/Pay';
import PaymentSuccess from '../page/PaymentSuccess';
import CoachBookings from '../page/coach/CoachBookings';
import CoachDashboard from '../page/coach/CoachDashboard';
import Chat from '../page/Chat';
import EmailVerification from '../page/EmailVerification';
import Register from '../page/Register';
import MembershipGuard from '../components/MembershipGuard';
import Layout from '../components/Layout';

/**
 * AppRoutes - Cung cấp cấu hình định tuyến (routing) cho toàn bộ ứng dụng
 * 
 * Component này định nghĩa các routes chính sử dụng React Router v7
 * và liên kết chúng với các component tương ứng.
 */

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
    path: "/coach",
    element: <Layout><MembershipGuard requiredMembership="premium" redirectTo="/membership"><CoachBookings /></MembershipGuard></Layout>,
  },
  {
    path: "/coach-dashboard",
    element: <Layout><CoachDashboard /></Layout>,
  },
  {
    path: "/chat",
    element: <Layout><MembershipGuard requiredMembership="premium" redirectTo="/membership"><Chat /></MembershipGuard></Layout>,
  },
  {
    path: "*",
    loader: () => { return window.location.replace('/') },
  }
]);

export default router;