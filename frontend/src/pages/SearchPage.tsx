import React, { useContext, useEffect, useState } from 'react';
import { Redirect, useParams } from 'react-router';
import { RouteChildrenProps } from 'react-router';
import { COLORS } from '../commons/constants';
import { User } from '../commons/interfaces';
import { GlobalContext } from "../context/GlobalState";
import "./ProfilePage.css";
import BOL from '../images/BOL_light.png' //dimensions are 1280*511, keep logo in this aspect ratio
import axios from 'axios';

export function SearchPage (){
    const {OAuthResponse} = useContext(GlobalContext);
    let [name, setName] = useState<string>("" as string);
    let [showResults, setShowResults] = useState<boolean>(true);

    function handleEnterPress(e: React.KeyboardEvent) {
        if(e.key === 'Enter'){
            //GenerateResults();
            setShowResults(true);
        }
    }

    return (
        <div className="profileContainer">
            <div className="profileBox"> 
                <div className="profileSpace_top"></div>
                <div className="profilelogoContainer" > 
                    <img src={BOL} alt= 'BOL logo' width = "360" height = "153.3"/>
                </div>
                <div className="profile_space_Between_Logo_and_UserProfile">
                    <p><b>User Search</b></p>
                </div>
                <div className="sub-container" style={{backgroundColor:"gray", padding: "10px"}}>
                <input id="message-box" 
                    style={{width: '80%', height:'25px', marginLeft:'40px', marginRight:'40px'}}
                    onChange={(e) => setName(e.target.value)} onKeyDown={handleEnterPress}
                />
                </div>
                <div style={{margin: "2% 2% 2% 2%"}}>
                    {showResults ? <GenerateResults nameToSearch={name} /> : <></>}
                </div>
            </div>
        </div>
    );
}

function GenerateResults(props: {nameToSearch: string}): JSX.Element {
    const [user_elements, set_user_elements] = useState<JSX.Element[]>([] as JSX.Element[]);

    // Only make background request and update if the nameToSearch changes
    useEffect(() => {
        // get a list of matching users to the search query
        getUsers(props.nameToSearch).then(user_list => {
            if (user_list.length < 1)
                set_user_elements([]);

            let new_user_elements: JSX.Element[] = [];
            // for each matching user, create an HTML entry and store it in an array
            for (var i = 0; i < user_list.length; i++){
                let cur_user = createEntry(user_list[i])
                new_user_elements.push(cur_user)
            }

            set_user_elements([...new_user_elements]);
        }).catch(err => {console.error(err); set_user_elements([])});
    }, [props.nameToSearch])

    // if that array is empty, we know there is no match
    if (user_elements.length == 0)
        return (<div> no user matches</div>);
    // otherwise render the list of elemments
    return (<div style={{margin: "3% 2% 3% 2%", overflow:"auto", maxHeight:"100%"}}>
        {user_elements}
    </div>);
}

// search for matching users
function getUsers(name: string): Promise<User[]> {
    return new Promise((resolve, reject) => {
        // If the user doesn't have a search, don't make the request
        if (name == "")
            resolve([]);
        else {  // Actually make the request
            axios.get(`http://localhost:5000/sources/searchUsers/${name}`).then(response => {
                resolve(response.data as User[]);
            }).catch(err => {console.error(err); reject([])});
        }
    });
}

// create HTML description for each matched user
// this contains the matched user's username and their profile link
function createEntry(match: User){
    let u_username : string;
    let u_userID: string;
    let u_profile: string;
    u_username = match.username;
    u_userID = match.userID;
    u_profile = "/profile/" + u_username;
    return (
        <div style={{backgroundColor:"white"}}>
            <a href={u_profile}> {u_username} </a>
        </div>
    );
}

export default SearchPage;