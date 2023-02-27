import { Component } from "react";
import '../SignUp/signUp.css';

export default class SignUp extends Component{
    render(){
        return(
           <div className="container">
                <form className="row g-3" id="signup-form">
                    <div className="col-md-6">
                        <label htmlFor="inputEmail4" className="form-label">First Name*</label>
                        <input type="email" className="form-control" id="inputEmail4"/>
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="inputPassword4" className="form-label">Last Name*</label>
                        <input type="password" className="form-control" id="inputPassword4"/>
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="inputAddress" className="form-label">Email*</label>
                        <input type="email" className="form-control" id="inputAddress" placeholder="Email"/>
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="inputAddress" className="form-label">School</label>
                        <input type="email" className="form-control" id="inputAddress" placeholder="Email"/>
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="inputAddress2" className="form-label">Password*</label>
                        <input type="text" className="form-control" id="inputAddress2" placeholder="Password"/>
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="inputCity" className="form-label">Confirm Password*</label>
                        <input type="text" className="form-control" id="inputCity"/>
                    </div>
                    <div className="col-12">
                        <button type="submit" className="btn btn-primary">Sign in</button>
                    </div>
                </form>
           </div>
        )
    }
}