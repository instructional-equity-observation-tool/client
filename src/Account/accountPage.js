import React, { useEffect, useState } from "react";
import '../Account/Account.css'
import { Auth } from "aws-amplify";
import { Storage } from "@aws-amplify/storage"
import AWS from "aws-sdk";
import {Buffer} from "buffer";
import Submission from "../Main/submission";
import { useNavigate } from "react-router-dom";

export default function Account(){
    const[isEditing, setIsEditing] = useState(false);
    const[userAttributes, setUserAttributes] = useState({});
    const navigate = useNavigate();
    const [report, setReport] = useState({})
    const [userObj, setUserObj] = useState({
        name: '',
        username: '',
        school: '',
        grade_level: '',
        state: '',
        zip: '',
    })

    const handleInputChange = (event, keyName) => {
        event.persist();
        setUserObj((user) => {
            return {...user, [keyName]: event.target.value}
        })
    }

    useEffect(() => {
        retrieveUserInfo();
        retrieveReports();
    }, []);



    function editProfile(){
        setIsEditing(true)
        let elements = document.getElementsByClassName("input-test");
        for(let i = 0; i < elements.length; i++){
            elements[i].readOnly = false;
            elements[i].disabled = false;
        }
    }

    async function updateUser(){
        const user = await Auth.currentAuthenticatedUser();
        await Auth.updateUserAttributes(user, {
            name: userObj.name,
            email: userObj.username,
            'custom:school': userObj.school,
            'custom:grade_level': userObj.grade_level,
            'custom:state': userObj.state,
            'custom:zip': userObj.zip,
        });
    }

    function saveProfile(){
        setIsEditing(false)
        let elements = document.getElementsByClassName("input-test");
        for(let i = 0; i < elements.length; i++){
            elements[i].readOnly = true;
            elements[i].disabled = true;
        }

        try{
            updateUser();
        }catch(error){
            console.log(error);
        }
    }


    async function retrieveUserInfo(){
        const user = await Auth.currentAuthenticatedUser();
        const { attributes } = user;
        setUserAttributes(attributes);
        setUserObj({
            name: attributes.name,
            username: attributes.email,
            school: attributes['custom:school'],
            grade_level: attributes['custom:grade_level'],
            state: attributes['custom:state'],
            zip: attributes['custom:zip'],
        });
    }

    async function retrieveReports(){
        AWS.config.update({ 
            region: 'us-east-2',
            apiVersion: 'latest',
            credentials: {
              accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
              secretAccessKey: process.env.REACT_APP_SECRET_ID,
            } 
          });
        const s3 = new AWS.S3();
        const user = await Auth.currentAuthenticatedUser();
        const location = user.username + '/sam-test-file'
        console.log(location)
        let params = {
            Bucket: 'user-analysis-objs183943-staging',
            Key: location,
            ResponseContentType: 'application/json'
        }
       s3.getObject(params, function (err, data){
            if(err) throw err;
            console.log(data)
            console.log(data.Body)
            console.log(JSON.parse(data.Body))
            setReport(JSON.parse(data.Body));
        })
    }

    function loadUserReport(event){
        event.preventDefault();
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
                                        <h4>{userAttributes.name}</h4>
                                        <p className="text-secondary mb-1">Teacher</p>
                                        <p className="text-muted font-size-sm">{userObj['school']}</p>
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
                                    <button className="btn btn-primary" onClick={(e) => loadUserReport(e)}>PDF1</button>
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
                                        <input className="input-test" disabled={true} value={userObj['name']} onChange={(e) => handleInputChange(e, 'name')}></input>
                                     </div>
                                </div>
                                <hr/>
                                <div className="row">
                                    <div className="col-sm-3">
                                        <h6 className="mb-0">Email</h6>
                                    </div>
                                    <div className="col-sm-9 text-secondary">
                                    <input className="input-test" disabled={true} value={userObj['username']} onChange={(e) => handleInputChange(e, 'username')}></input>
                                    </div>
                                </div>
                                <hr/>
                                <div className="row">
                                    <div className="col-sm-3">
                                         <h6 className="mb-0">School</h6>
                                    </div>
                                    <div className="col-sm-9 text-secondary">
                                    <input className="input-test" disabled={true} value={userObj['school']} onChange={(e) => handleInputChange(e, 'school')}></input>
                                    </div>
                                </div>
                                <hr/>
                                <div className="row">
                                    <div className="col-sm-3">
                                        <h6 className="mb-0">Grade Level</h6>
                                    </div>
                                    <div className="col-sm-9 text-secondary">
                                    <input className="input-test" disabled={true} value={userObj['grade_level']} onChange={(e) => handleInputChange(e, 'grade_level')}></input>
                                    </div>
                                </div>
                                <hr/>
                                <div className="row">
                                    <div className="col-sm-3">
                                        <h6 className="mb-0">State</h6>
                                    </div>
                                    <div className="col-sm-9 text-secondary">
                                    <input className="input-test" disabled={true} value={userObj['state']} onChange={(e) => handleInputChange(e, 'state')}></input>
                                    </div>
                                </div>
                                <hr/>
                                <div className="row">
                                    <div className="col-sm-3">
                                        <h6 className="mb-0">Zip Code</h6>
                                    </div>
                                    <div className="col-sm-9 text-secondary">
                                    <input className="input-test" disabled={true} value={userObj['zip']} onChange={(e) => handleInputChange(e, 'zip')}></input>
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