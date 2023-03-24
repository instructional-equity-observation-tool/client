import React, { Component } from 'react'
import '../Login/login.css'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Auth } from 'aws-amplify'
import { NavItem } from 'react-bootstrap'
import signOut from '../SignOut/signOut'


const LogIn = () => {
    let navigate = useNavigate();
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

    async function signIn(event) {
        event.preventDefault();
        try{
            const test = await Auth.signIn({username: user.username, password: user.password});
            console.log(test);
            navigate("/home")
        }catch(error){
            console.log(error)
        }
    }

    // async function checkUser(event){
    //     event.preventDefault();
    //     try{
    //         const test = await Auth.currentAuthenticatedUser();
    //         console.log(test)
    //     }catch(error){
    //         console.log(error)
    //     }
        
    // }


    return (
        <div className='container'>
            <form id='login-form'>
            <h2 id='title'>C2AI</h2>
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
            className="btn btn-primary" 
            id='submit-login'
            onClick={(e) => signIn(e)}
            >Log In
            </button>
            {/* <button className="nav-link text-light" onClick={(e) => signOut(e)} id='sign-out'>Check</button> */}
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