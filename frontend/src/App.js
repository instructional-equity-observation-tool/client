import React from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Account from "./Account/accountPage";

import Layout from "./Layout/navbar";
import { Main } from "./Main/mainUserPage";
import LogIn from "./Auth/login";
import SignUp from "./Auth/signUp";
import PrivateRoute from "./PrivateRoute";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Layout />}>
          {/* <Route exact path='/home' element={<PrivateRoute/>}> */}
            <Route exact path='/home' render={<Main/>}/>
          {/* </Route> */}
          <Route path="account" element={<Account />} />
          <Route path="login" element={<LogIn />} />
          <Route path="signup" element={<SignUp />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
