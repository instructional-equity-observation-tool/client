import React from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Account from "./Account/accountPage";

import Layout from "./Layout/navbar";
import { Main } from "./Main/mainUserPage";
import Login from "./Login/login";
import SignUp from "./SignUp/signUp";
import PrivateRoute from "./PrivateRoute";
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsconfig from './client-main/aws-exports'
import { Amplify } from "aws-amplify";

Amplify.configure(awsconfig);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Layout />}>
          <Route path="/" element={<Main />}/>
          <Route path="account" element={<Account />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default withAuthenticator(App);
