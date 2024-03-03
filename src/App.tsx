import React from "react";

// Import the styles
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/core/lib/styles/index.css";

import Main from './pages';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/login/login";
import AuthenticationProvider from "./provider/AuthenticationProvider";

function App() {
  return (
    <BrowserRouter>
      <AuthenticationProvider>
        <Routes>
          <Route path={"/"} element={<Login />} />
          <Route path={"/keystone"} element={<Main />} />
          <Route path={"*"} element={<Navigate replace to={"/"} />} />
        </Routes>
      </AuthenticationProvider>
    </BrowserRouter>
  );
}

export default App;
