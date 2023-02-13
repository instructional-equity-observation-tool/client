import React from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Account from "./Account/accountPage";

import Layout from "./Layout/navbar";
import { Main } from "./Main/mainUserPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Main />} />
          <Route path="account" element={<Account />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
