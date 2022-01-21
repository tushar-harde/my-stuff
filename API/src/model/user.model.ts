const user = {
    userID: 0,
    name: '',
    profilePicture: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    userName: '',
    password: '',
    googleID: '',
    facebookID: '',
    userRefreshToken: ''
};

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
    originalPassword?: string;
    constructor(result: any) {}
}