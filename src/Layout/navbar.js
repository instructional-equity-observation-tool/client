import React from "react"
import {Outlet, Link} from "react-router-dom";
// import signOut from "../SignOut/signOut";
import "../Layout/navbar.css"
import { Auth } from "aws-amplify";
import { useNavigate } from "react-router-dom";

const Layout = () => {
    let navigate = useNavigate();
    async function signOut(event){
        event.preventDefault();
        try{
            await Auth.signOut();
            console.log("Sign out succesfully")
            navigate("/")
        }catch (error){
            console.log('error signing out: ', error);
        }
    }
    
        return(
            <><><nav className="navbar navbar-expand-lg" id="main-nav">
                <a className="navbar-brand" href="#">
                    <img
                        src="https://brand.tcu.edu/wp-content/uploads/2015/12/TCULogo_purple_5X7-01.jpg"
                        className="tcu-image"
                        width="80"
                        height="80"
                        alt="" />
                </a>

                <div className="collapse navbar-collapse justify-content-end" id="navbarCollapse">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link to="/home" className="nav-link text-light"> Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/account" className="nav-link text-light"> Account</Link>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link text-light" onClick={(e) => signOut(e)} id='sign-out'>Sign Out</a>
                        </li>
                    </ul>
                </div>
            </nav>

                <Outlet />
                </>
                
                </>
        )
}

export default Layout;
