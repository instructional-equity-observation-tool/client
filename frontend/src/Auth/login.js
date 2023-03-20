import React, { Component } from 'react'
import './login.css'
import { Link } from 'react-router-dom'
import { useState } from 'react'
// import { Auth } from 'aws-amplify'

const LogIn = () => {
    // let history = userHistory();
    const [user, setUser] = useState({
        username: '',
        password: ''
    })

    const handleInputChange = (event, keyName) => {
        event.persist();
        setUser((user) => {
            return {...user, [keyName]: event.target.value}
        })
    }

    const logIn = async() => {
        try{
            // await Auth.signIn({
            //     username: user.username,
            //     password: user.password
            // });
            // history.push('./home')
        }catch(error){
            console.error(error)
        }
    }

    return (
        <div className='container'>
            <form id='login-form'>
            <div className="form-group">
                <label>Email address</label>
                <div className='input-login'>
                    <input 
                    type="email" 
                    className="form-control" 
                    id="exampleInputEmail1" 
                    aria-describedby="emailHelp" 
                    placeholder="Enter email"
                    value={user.username}
                    onChange={(e) => handleInputChange(e, 'username')}/>
                </div>
            </div>
            <div className="form-group">
                <label>Password</label>
                <div className='input-login'>
                    <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Enter password"
                    value={user.password}
                    onChange={(e) => handleInputChange(e, 'password')}/>
                </div>
                <small id="emailHelp" className="form-text text-muted">We'll never share your password with anyone else.</small>
            </div>
            <button 
            type="submit" 
            className="btn btn-primary" 
            id='submit-login'
            onClick={() => logIn()}
            >Log In
            </button>
            <div className="w-full">
                <hr />
                <p className="text-gray-700 pb-2 pt-2 text-sm">Don't have an account?</p>
                <Link
                    to={{
                    pathname: '/signup'
                    }}
                    className="btn btn-success"
                >
                    Register
                </Link>
            </div>
        </form>
        </div>
    )
}
export default LogIn;