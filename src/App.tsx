import React from "react";

// Import the styles
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/core/lib/styles/index.css";

import Main from './pages/main/main';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/login/login";
import AuthenticationProvider from "./provider/AuthenticationProvider";
import NavigationBar from "./components/navigationBar/navigationBar";
import Job from "./pages/job/job";

function App() {
  return (
    <BrowserRouter>
      <AuthenticationProvider>
        <Routes>
          <Route path={"/"} element={<Login />} />
          <Route element={<NavigationBar />} >
            <Route path={'/job'} element={<Job />} />
            <Route path={"/keystone"} element={<Main />} />
          </Route>

          <Route path={"*"} element={<Navigate replace to={"/"} />} />
        </Routes>
      </AuthenticationProvider>
    </BrowserRouter>
  );
}

export default App;
