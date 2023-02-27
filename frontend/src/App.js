import React from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Account from "./Account/accountPage";

import Layout from "./Layout/navbar";
import { Main } from "./Main/mainUserPage";
import Login from "./Login/login";
import SignUp from "./SignUp/signUp";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Main />} />
          <Route path="account" element={<Account />} />
          <Route path="contact" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
