import React, { Component } from 'react'
import '../Login/login.css'


export default class Login extends Component {
  render() {
    return (
        <div className='container'>
            <form id='login-form'>
            <div className="form-group">
                <label>Email address</label>
                <div className='input-login'>
                    <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email"/>
                </div>
            </div>
            <div className="form-group">
                <label>Password</label>
                <div className='input-login'>
                    <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email"/>
                </div>
                <small id="emailHelp" className="form-text text-muted">We'll never share your password with anyone else.</small>
            </div>
            <button type="submit" className="btn btn-primary" id='submit-login'>Submit</button>
        </form>
        </div>
    )
  }
}