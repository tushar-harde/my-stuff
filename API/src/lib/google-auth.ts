const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class GoogleAuth {
    async verify(idToken: string) {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = await ticket.getPayload();
        return {
            name: payload.name,
            profilePicture: payload.picture,
            email: payload.email,
            googleID: payload.sub
        };
    };
}

// const googleAuth = {};

// googleAuth.verify = async (idToken) => {
//     const ticket = await client.verifyIdToken({
//         idToken,
//         audience: process.env.GOOGLE_CLIENT_ID,
//     });
//     const payload = await ticket.getPayload();
//     return {
//         name: payload.name,
//         profilePicture: payload.picture,
//         email: payload.email,
//         googleID: payload.sub
//     };
// };

// module.exports = googleAuth;