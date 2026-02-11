import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.jsx";
import "./index.css";

// Normal sayfalar
import Home from "./pages/Home.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import Profile from "./pages/Profile.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import EditPost from "./pages/EditPost.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";

// Admin sayfaları
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Posts from "./pages/admin/Posts.jsx";
import Users from "./pages/admin/Users.jsx";
import Categories from "./pages/admin/Categories.jsx";
import Reports from "./pages/admin/Reports.jsx";

import { AuthProvider } from "./context/AuthContext.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/post/:slug", element: <PostDetail /> },
      { path: "/profile/:id", element: <Profile /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/create", element: <CreatePost /> },
      { path: "/edit/:id", element: <EditPost /> },
      { path: "/edit-profile", element: <EditProfile /> },
      { path: "/kategori/:id", element: <CategoryPage /> },
    ],
  },

  // ⭐ Admin route burda olmalı, ÜST DÜZEYDE
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "", element: <Dashboard /> },
      { path: "posts", element: <Posts /> },
      { path: "users", element: <Users /> },
      { path: "categories", element: <Categories /> },
      { path: "reports", element: <Reports /> },
    ],
  },
]);


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
