import { Component } from "react";
import '../SignUp/signUp.css';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Auth } from "aws-amplify";


const SignUp = () => {
    let navigate = useNavigate();
    const [user, setUser] = useState({
        name: '',
        username: '',
        password: '',
        school: '',
        grade_level: '',
        authCode: '',
    })

    const handleInputChange = (event, keyName) => {
        event.persist();
        setUser((user) => {
            return {...user, [keyName]: event.target.value}
        })
    }

    async function signUp(event){
        event.preventDefault();
        try{
            await Auth.signUp({
                username: user.username,
                password: user.password,
                attributes: {
                    name: user.name,
                    email: user.username,
                    'custom:school': user.school,
                    'custom:grade_level': user.grade_level,
                },
                    autoSignIn: {
                        enabled: true,
                    }
            });
            navigate('/confirmSignUp')
        }catch(error){
            console.log(error)
        }
    }


    return(
        <div className="container">
            <form className="row g-3" id="signup-form">
                <div className="col-md-6">
                    <label htmlFor="inputEmail4" className="form-label">Name*</label>
                    <input 
                    type="text" 
                    className="form-control" 
                    id="inputEmail4" 
                    value={user.name} 
                    placeholder="First name"
                    onChange={(e) => handleInputChange(e, 'name')}/>
                </div>
                <div className="col-md-6">
                    <label htmlFor="inputAddress" className="form-label">Email*</label>
                    <input 
                     type="text"
                     className="form-control" 
                     id="inputEmail4" 
                     value={user.username} 
                     placeholder="Email"
                     onChange={(e) => handleInputChange(e, 'username')}/>
                </div>
                <div className="col-md-4">
                    <label htmlFor="inputAddress2" className="form-label">School</label>
                    <input 
                    type="text" 
                    className="form-control" 
                    id="inputAddress2" 
                    value={user.school} 
                    placeholder="School"
                    onChange={(e) => handleInputChange(e, 'school')}/>
                </div>
                <div className="col-md-4">
                    <label htmlFor="inputAddress2" className="form-label">Grade Level</label>
                    <input 
                    type="text" 
                    className="form-control" 
                    id="inputAddress2" 
                    value={user.grade_level} 
                    placeholder="Grade Level (e.g. fourth, second)"
                    onChange={(e) => handleInputChange(e, 'grade_level')}/>
                </div>
                <div className="col-md-4">
                    <label htmlFor="inputAddress2" className="form-label">Password*</label>
                    <input 
                    type="text" 
                    className="form-control" 
                    id="inputAddress2" 
                    value={user.password} 
                    placeholder="Password"
                    onChange={(e) => handleInputChange(e, 'password')}/>
                </div>
                <div className="col-12">
                    <button type="submit" className="btn btn-primary" onClick={(e) => signUp(e)}>Sign Up</button>
                </div>
                <div className="w-full">
                    <hr />
                    <p className="text-gray-700 pb-2 pt-2 text-sm">You already have an account?</p>
                    <Link
                        to={{
                        pathname: '/'
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
