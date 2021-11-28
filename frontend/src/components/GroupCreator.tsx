import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Checkbox, Button } from '@mui/material';

import { User, Friendship } from '../commons/interfaces';
import { arrayOf } from 'prop-types';

export default function GroupCreator(props: any): JSX.Element {
    // List of users to be added to and removed from the group
    const [listOfUsersToAdd, setListOfUsersToAdd] = useState<User[]>([] as User[]);
    const [listOfUsersToRem, setListOfUsersToRem] = useState<User[]>([] as User[]);
    const [finalListOfUsersToAdd, setFinalListOfUsersToAdd] = useState<User[]>([] as User[]);

    useEffect(() => {
        console.log("In state: ", listOfUsersToAdd, listOfUsersToRem);
    }, [listOfUsersToAdd, listOfUsersToRem])

    // Wait until the props are populated with values
    if (props.userID == "")
        return <></>;

    // Change the list of users, if add is true, add; if it is false, remove the passed user
    function changeUserList(friend: User, add: boolean): void {
        if (add) {
            if (!listOfUsersToAdd.includes(friend)) {
                let newListOfUsersToAdd = listOfUsersToAdd;
                newListOfUsersToAdd.push(friend);
                setListOfUsersToAdd([...newListOfUsersToAdd]);
            }
        } else {
            if (!listOfUsersToRem.includes(friend)) {
                let newListOfUsersToRem = listOfUsersToRem;
                newListOfUsersToRem.push(friend);
                setListOfUsersToRem([...newListOfUsersToRem]);
            }
        }
    }

    function createGroup(): void {
        // Create the final list of users to add
        // Do the actual db request
    }

    return (<Box>
        <FriendDisplay userID={props.userID} addFriendToGroupCallback={changeUserList} />
        <Button onClick={createGroup} />
        </Box>
    );
}

function FriendDisplay(props: {
    userID: string,
    addFriendToGroupCallback: (friend: User, add: boolean) => void
}): JSX.Element {

    const [cardArray, setCardArray] = useState<JSX.Element[]>([]);

    useEffect(() => {
        // Create the array of cards for each message. Awaits for the request to finish before setting the card array, which triggers a render
        async function populateCardArray() {
            // Clear out old group messages
            let newCardArray = [] as JSX.Element[]

            await getFriendsList(props.userID).then(list => {
                for (let friend of list)
                    singleCardGenerator(friend, props.addFriendToGroupCallback).then(card => newCardArray.push(card));
            });

            setCardArray([...newCardArray]);
        }
        setTimeout(populateCardArray, 500); // Timeout to let the backend update first
    }, [props.userID]);

    if (cardArray.length < 1) {
        return (<p>You have no friends.</p>);
    }
    else return (
    <div style={{margin: "3% 2% 3% 2%", paddingTop: "2%", overflow:"auto", maxHeight:"100%"}}>
        {cardArray}
    </div>);
}

function singleCardGenerator(friend: User, addFriendToGroupCallback: (friend: User, add: boolean) => void): Promise<JSX.Element> {
    return new Promise((resolve, reject) => {
        resolve(
            <Box
                sx={{
                    width: '80%',
                    maxWidth: '90%',
                    display: 'flex',
                    marginBottom: '2%',
                    textAlign: 'left'
                }}
            >
                <Checkbox onChange={(e, checked) => addFriendToGroupCallback(friend, checked)} />
                <img id='123' src={friend.profilePicPath} alt="Profile Picture" style={{maxWidth: '20%', marginLeft: '3%'}} />
                <div 
                    style={{
                        flex: '0 1 auto',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        alignSelf: 'flex-start',
                        marginLeft: '5%'
                    }}
                >
                    <p>{friend.username}</p>
                </div>
            </Box>
        );
    });
}

function getFriendsList(userID: string): Promise<User[]> {
    return new Promise((resolve, reject) => {
        axios.get(`http://localhost:5000/sources/getFriends/${userID}`).then(response => {
            let arrayOfFriends = [] as User[];

            for (let friendship of response.data)
                arrayOfFriends.push(getFriendObject(userID, friendship));

            resolve(arrayOfFriends);
        }).catch(err => reject(err));
    });
}

// Returns the "other person" in the friendship
function getFriendObject(currentUserID: string, friendship: Friendship): User {
    if (friendship.fromUser.userID == currentUserID)
        return friendship.toUser;
    else return friendship.fromUser;
}