import { createBrowserRouter } from "react-router";

import RootLayout from "../layouts/RootLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import Home from "../pages/Home/Home/Home";

import Login from "../pages/Auth/login/Login";
import Register from "../pages/Auth/Register/Register";

import DashboardHome from "../pages/Dashboard/DashboardHome";

import AddBusiness from "../pages/business/AddBusiness";
import BusinessDashboard from "../pages/business/BusinessDashboard";
import BusinessAccounts from "../pages/business/BusinessAccounts";
import AdminAnalytics from "../pages/Analytics/AdminAnalytics";

import PrivateRoute from "./PrivateRoute";
import RoleRoute from "./RoleRoute";
import Campaigns from "../pages/Campaign/Campaigns";
import CampaignsPublic from "../pages/Campaign/CampaignsPublic";
import CollectorPerformance from "../pages/Collector/CollectorPerformance";
import MyPerformance from "../pages/Collector/MyPerformance";
import NotificationCenter from "../pages/Notification/NotificationCenter";
import MyNotifications from "../pages/Notification/MyNotifications";
import UserManagement from "../pages/Admin/UserManagement";
import AdminRoute from "./AdminRoute";
import NotFound from "../pages/Shared/NotFound/NotFound";
import Profile from "../pages/Profile/Profile";
import Settings from "../pages/Settings/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "profile",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        ),
      },
      {
        path: "campaigns",
        element: (
          <PrivateRoute>
            <CampaignsPublic />
          </PrivateRoute>
        ),
      },
      {
        path: "notifications",
        element: (
          <PrivateRoute>
            <MyNotifications />
          </PrivateRoute>
        ),
      },
    ],
  },

  {
    path: "/",
    Component: AuthLayout,
    children: [
      {
        path: "login",
        Component: Login,
      },
      {
        path: "register",
        Component: Register,
      },
    ],
  },

  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        Component: DashboardHome,
      },

      {
        path: "add-business",
        element: (
          <RoleRoute allowedRoles={["Business"]}>
            <AddBusiness />
          </RoleRoute>
        ),
      },
      {
        path: "business-dashboard",
        element: (
          <RoleRoute allowedRoles={["Business"]}>
            <BusinessDashboard />
          </RoleRoute>
        ),
      },
      {
        path: "my-performance",
        element: (
          <RoleRoute allowedRoles={["Collector"]}>
            <MyPerformance />
          </RoleRoute>
        ),
      },

      {
        path: "businesses",
        element: (
          <AdminRoute>
            <BusinessAccounts />
          </AdminRoute>
        ),
      },

      {
        path: "analytics",
        element: (
          <AdminRoute>
            <AdminAnalytics />
          </AdminRoute>
        ),
      },
      {
        path: "campaigns",
        element: (
          <AdminRoute>
            <Campaigns />
          </AdminRoute>
        ),
      },
      {
        path: "collector-performance",
        element: (
          <AdminRoute>
            <CollectorPerformance />
          </AdminRoute>
        ),
      },
      {
        path: "notifications",
        element: (
          <AdminRoute>
            <NotificationCenter />
          </AdminRoute>
        ),
      },
      {
        path: "users",
        element: (
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        ),
      },
    ],
  },

  {
    path: "*",
    Component: NotFound,
  },
]);
