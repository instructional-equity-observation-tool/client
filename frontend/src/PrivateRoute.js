import React, { useState, useEffect }  from 'react';
import { Navigate, Outlet, Redirect, Route } from "react-router-dom";
// import { Auth } from 'aws-amplify';
import { Main } from './Main/mainUserPage';
import { redirect } from 'react-router-dom';

const PrivateRoute = ({ children, ...rest }) => {
  const [signInUser, setSignInUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let getUser = async() => {
      try {
        // let user = await Auth.currentAuthenticatedUser();
        // await setSignInUser(user);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.log(error)        
      }
    }
    getUser();
  },[]);

  if(isLoading) {
    return <p>...Loading</p>
  }

  return (
    signInUser ? <Outlet /> : <Navigate to="/login" />
  );
}

export default PrivateRoute;