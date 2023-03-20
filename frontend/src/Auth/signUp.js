import { Component } from "react";
import './signUp.css';
import { useState } from "react";
import { Link } from "react-router-dom";
// import { Auth } from "aws-amplify";


const SignUp = () => {
    // let history = useHistory();
    const [user, setUser] = useState({
        first: '',
        last: '',
        email: '',
        phone: '',
        school: '',
        password: '',
    })

    const handleInputChange = (event, keyName) => {
        event.persist();
        setUser((user) => {
            return {...user, [keyName]: event.target.value}
        })
    }

    const signUp = async () => {
        try{
            // await Auth.signUp({
            //     username: user.username,
            //     password: user.password,
            //     attributes: {
            //         email: user.username
            //     },
            //         autoSignIn: {
            //             enabled: true,
            //         }
            // });
            // history.push("/confirm-register")
        }catch(error){
            console.log(error)
        }
        console.log(user)
    }


    return(
        <div className="container">
            <form className="row g-3" id="signup-form">
                <div className="col-md-6">
                    <label htmlFor="inputEmail4" className="form-label">First Name*</label>
                    <input 
                    type="text" 
                    className="form-control" 
                    id="inputEmail4" 
                    value={user.first} 
                    placeholder="First name"
                    onChange={(e) => handleInputChange(e, 'first')}/>
                </div>
                <div className="col-md-6">
                    <label htmlFor="inputPassword4" className="form-label">Last Name*</label>
                    <input 
                    type="text" 
                    className="form-control" 
                    id="inputPassword4" 
                    value={user.last} 
                    placeholder="Last Name"
                    onChange={(e) => handleInputChange(e, 'last')}/>
                </div>
                <div className="col-md-6">
                    <label htmlFor="inputAddress" className="form-label">Email*</label>
                    <input 
                     type="text"
                     className="form-control" 
                     id="inputAddress" 
                     value={user.username} 
                     placeholder="Email"
                     onChange={(e) => handleInputChange(e, 'email')}/>
                </div>
                <div className="col-md-6">
                    <label htmlFor="inputAddress" className="form-label">School</label>
                    <input 
                    type="text" 
                    className="form-control"
                    id="inputAddress" 
                    value={user.school} 
                    placeholder="School"
                    onChange={(e) => handleInputChange(e, 'school')}
                    />
                </div>
                <div className="col-md-6">
                    <label htmlFor="inputAddress2" className="form-label">Password*</label>
                    <input 
                    type="text" 
                    className="form-control" 
                    id="inputAddress2" 
                    value={user.password} 
                    placeholder="Password"
                    onChange={(e) => handleInputChange(e, 'password')}/>
                </div>
                <div className="col-md-6">
                    <label htmlFor="inputCity" className="form-label">Confirm Password*</label>
                    <input type="text" className="form-control" id="inputCity" placeholder="Confirm Password"/>
                </div>
                <div className="col-12">
                    <button type="submit" className="btn btn-primary" onClick={() => signUp()}>Sign Up</button>
                </div>
                <div className="w-full">
                    <hr />
                    <p className="text-gray-700 pb-2 pt-2 text-sm">You already have an account?</p>
                    <Link
                        to={{
                        pathname: '/login'
                        }}
                        className="btn btn-success"
                    >
                        Log in
                    </Link>
                </div>
            </form>
        </div>
    )
}

export default SignUp;