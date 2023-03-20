import React, { useState } from "react";
import '../Account/Account.css'


export default function Account(){
    const[isEditing, setIsEditing] = useState(false);

    function editProfile(){
        setIsEditing(true)
        let elements = document.getElementsByClassName("input-test");
        for(let i = 0; i < elements.length; i++){
            elements[i].readOnly = false;
            elements[i].disabled = false;
        }
    }

    function saveProfile(){
        setIsEditing(false)
        let elements = document.getElementsByClassName("input-test");
        for(let i = 0; i < elements.length; i++){
            elements[i].readOnly = true;
            elements[i].disabled = true;
        }
    }

    return(
        <div className="container">
            <div className="main-body">
                <div className="row gutters-sm" id="test1">
                    <div className="col-md-4 mb-3" id="test2">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex flex-column align-items-center text-center">
                                    <div className="mt-3">
                                        <h4>John Doe</h4>
                                        <p className="text-secondary mb-1">Teacher</p>
                                        <p className="text-muted font-size-sm">Pascal High School</p>
                                        {/* <button className="btn btn-primary">Follow</button>
                                        <button className="btn btn-outline-primary">Message</button> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card mt-2">
                            <ul className="list-group">
                                <li className="list-group-item" id="my-reports">
                                    <h4>My Reports</h4>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                                    <p>PDF1</p>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                                    <p>PDF2</p>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                                    <p>PDF3</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="col" id="test3">
                        <div className="card mb-3" id="test4">
                            <div className="card-body">
                            <div className="row">
                                    <h3 className="mb-0">About Me</h3>
                                </div>
                                <hr/>
                                <div className="row">
                                    <div className="col-sm-3">
                                        <h6 className="mb-0">Full Name</h6>
                                    </div>
                                    <div className="col-sm-9 text-secondary">
                                        <input  readOnly={true} className="input-test" disabled={true}></input>
                                     </div>
                                </div>
                                <hr/>
                                <div className="row">
                                    <div className="col-sm-3">
                                        <h6 className="mb-0">Email</h6>
                                    </div>
                                    <div className="col-sm-9 text-secondary">
                                    <input  readOnly={true} className="input-test" disabled={true}></input>
                                    </div>
                                </div>
                                <hr/>
                                <div className="row">
                                    <div className="col-sm-3">
                                         <h6 className="mb-0">Phone</h6>
                                    </div>
                                    <div className="col-sm-9 text-secondary">
                                    <input  readOnly={true} className="input-test" disabled={true}></input>
                                    </div>
                                </div>
                                <hr/>
                                <div className="row">
                                    <div className="col-sm-3">
                                        <h6 className="mb-0">School</h6>
                                    </div>
                                    <div className="col-sm-9 text-secondary">
                                    <input  readOnly={true} className="input-test" disabled={true}></input>
                                    </div>
                                </div>
                                <hr/>
                                <div className="row">
                                    <div className="col-sm-3">
                                        {isEditing ? (
                                            <div>
                                                <button className="btn btn-primary" onClick={editProfile}>Edit</button>
                                                <button className="btn btn-danger" id="submit" onClick={saveProfile}>Submit</button>
                                            </div>
                                        ) : (
                                            <button className="btn btn-primary" onClick={editProfile}>Edit</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}