import { Auth } from 'aws-amplify';
import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";

const ConfirmRegister = () => {
  let navigate = useNavigate();
  const [user, setUser] = useState({ username: '', authenticationCode: '', });

  const handleInputChange = (event, keyName) => {
    event.persist();
    setUser((user) => {
      return { ...user, [keyName]: event.target.value }
    })
  }

  const confirmSignUp = async () => {
    try {
      await Auth.confirmSignUp(user.username, user.authenticationCode);
      console.log('success confirm sign up');
      navigate('/home')
    } catch (error) {
      console.log('error', error);
    }
  }

  return (
    <div className="container w-4/12 w-medium">
      <div className="bg-white shadow-xl rounded px-12 pt-6 pb-8 mb-4">
        <h3 className="text-lg text-gray-700">Confirm your account</h3>
        <input
          type="text"
          value={user.username}
          onChange={(e) => handleInputChange(e, 'username')}
        />
        <input
          type="text"
          value={user.authenticationCode}
          onChange={(e) => handleInputChange(e, 'authenticationCode')}
        />
        <button
          onClick={() => confirmSignUp()}
          className="btn btn-primary">
          Confirm
        </button>
        <div>
          <Link
            to={{
              pathname: '/register'
            }}
            className="pt-2 text-sm text-blue-500 hover:text-blue-600"
          >
            Back
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ConfirmRegister;