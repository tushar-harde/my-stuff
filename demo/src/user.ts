import { setPropertiesDecorator } from "./db";

@setPropertiesDecorator
export class User {
    userID = 0;
    name = '';
    profilePicture = '';
    email = '';
    phone = '';
    dateOfBirth = '';
    gender = '';
    userName = '';
    password = '';
    googleID = '';
    facebookID = '';
    userRefreshToken = '';
    constructor()  {}
}