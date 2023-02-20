import React from "react"
import {Outlet, Link} from "react-router-dom";

export default class Layout extends React.Component {
    render(){
        return(
            <><><nav className="navbar navbar-expand-lg bg-dark">
                <a className="navbar-brand" href="#">
                    <img
                        src="https://a.espncdn.com/combiner/i?img=/i/teamlogos/ncaa/500/2628.png"
                        className="tcu-image"
                        width="80"
                        height="80"
                        alt="" />
                </a>

                <div className="collapse navbar-collapse justify-content-end" id="navbarCollapse">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link to="/" className="nav-link text-light"> Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/account" className="nav-link text-light"> Account</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/contact" className="nav-link text-light"> Contact Us</Link>
                        </li>
                    </ul>
                </div>
            </nav>

                <Outlet />
                </>
                {/* <footer className="py-3 my-4" id="footer">
                    <ul className="nav justify-content-center border-bottom pb-3 mb-3">
                        <li className="nav-item">
                            <a href="#" className="nav-link px-2 text-muted">
                                Home
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link px-2 text-muted">
                                Features
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link px-2 text-muted">
                                FAQs
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link px-2 text-muted">
                                Pricing
                            </a>
                        </li>
                    </ul>
                    <p className="text-center text-muted">
                        © 2022 Instructional Equity Observation Tool, Inc
                    </p>
                </footer> */}
                
                </>
        )
    }
}