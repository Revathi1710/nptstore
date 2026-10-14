import React from "react";
import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AddProduct from "./pages/AddProduct";
import AllProduct from "./pages/AllProduct";
import Dashboard from "./pages/Dashboard";
import EditProduct from "./pages/EditProduct ";
import AllOrders from "./pages/AllOrders";
import AdminLogin from "./pages/AdminLogin";
import AddBlog from "./pages/AddBlog";
import AllBlogs from "./pages/Blogs";
import EditBlog from "./pages/EditBlog";
import AdminProtectedRoute from "./component/AdminProtectedRoute";
import ChangePassword from "./pages/ChangePassword";
import UploadProjects from "./pages/UploadProjects";
import PdfList from "./pages/PdfList";
import AllUser from "./pages/AllUser";
import DownloadSampleUser from "./pages/DownloadSampleUser";
function App() {

  return (
    <BrowserRouter  basename="/admin/">
      <Routes>

        {/* 🔓 Public Route */}
        <Route path="/" element={<AdminLogin />} />

        {/* 🔐 Protected Routes */}
        <Route path="/dashboard" element={
          <AdminProtectedRoute>
            <Dashboard />
          </AdminProtectedRoute>
        } />

        <Route path="/addProduct" element={
          <AdminProtectedRoute>
            <AddProduct />
          </AdminProtectedRoute>
        } />

        <Route path="/allProduct" element={
         
            <AllProduct />
         
        } />

        <Route path="/editProduct/:id" element={
          <AdminProtectedRoute>
            <EditProduct />
          </AdminProtectedRoute>
        } />

        <Route path="/orders" element={
          <AdminProtectedRoute>
            <AllOrders />
          </AdminProtectedRoute>
        } />
<Route path="/settings/password" element={
          
            <ChangePassword />
          
        } />
        <Route path="/addBlog" element={
          <AdminProtectedRoute>
            <AddBlog />
          </AdminProtectedRoute>
        } />

        <Route path="/blogs" element={
          <AdminProtectedRoute>
            <AllBlogs />
          </AdminProtectedRoute>
        } />

        <Route path="/editBlog/:id" element={
          <AdminProtectedRoute>
            <EditBlog />
          </AdminProtectedRoute>
        } />
  <Route path="/allUser" element={
          <AdminProtectedRoute>
            <AllUser />
          </AdminProtectedRoute>
        } />
  <Route path="/sample-request" element={
          <AdminProtectedRoute>
            <DownloadSampleUser />
          </AdminProtectedRoute>
        } />
       <Route path="/uploadProject" element={<UploadProjects/>}/>
       <Route path ="/allpdf" element={<PdfList/>}/>
       </Routes>
    </BrowserRouter>
  );
}

export default App;