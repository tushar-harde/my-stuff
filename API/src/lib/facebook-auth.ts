const https = require('https');

interface FBInfo {
    id: number;
    name: string;
    picture: any;
    email: string;
    gender: string;
    birthday: string;
}

export class FacebookAuth {
    getUserProfile(idToken: string) {
        return new Promise<FBInfo>((resolve, reject) => {
            try {
                const payload = JSON.stringify({
                    access_token: idToken,
                    fields: "id,name,email,picture,gender,birthday"
                });
            
                const options = {
                    hostname: 'graph.facebook.com',
                    path: '/me',
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Content-Length': payload.length
                    }
                }
        
                const req = https.request(options, (res: any) => {
                    var str = '';     
                    res.on('data', (chunk: string) => {
                        str += chunk;
                    });
        
                    res.on('end', function () {
                        if (+res.statusCode === 200) {
                            resolve(JSON.parse(str));
                        } else {
                            reject({
                                status: res.statusCode,
                                message: JSON.parse(str)
                            });
                        }
                    });
                });
                
                req.on('error', (error: Error) => {
                    console.log('err' + error);
                    reject(error);
                });
                
                req.write(payload);
                req.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    async verify(idToken: string) {
        const user = await this.getUserProfile(idToken);
        return {
            facebookID: user.id,
            name: user.name,
            profilePicture: user.picture.data.url,
            email: user.email,
            gender: user.gender,
            dateOfBirth: user.birthday
        };
    }
}

// var getUserProfile = (idToken) => {
//     return new Promise((resolve, reject) => {
//         try {
//             const payload = JSON.stringify({
//                 access_token: idToken,
//                 fields: "id,name,email,picture,gender,birthday"
//             });
        
//             const options = {
//                 hostname: 'graph.facebook.com',
//                 path: '/me',
//                 method: 'POST',
//                 headers: {
//                   'Content-Type': 'application/json',
//                   'Content-Length': payload.length
//                 }
//             }
    
//             const req = https.request(options, res => {
//                 var str = '';     
//                 res.on('data', chunk => {
//                     str += chunk;
//                 });
    
//                 res.on('end', function () {
//                     if (+res.statusCode === 200) {
//                         resolve(JSON.parse(str));
//                     } else {
//                         reject({
//                             status: res.statusCode,
//                             message: JSON.parse(str)
//                         });
//                     }
//                 });
//             });
            
//             req.on('error', error => {
//                 console.log('err' + error);
//                 reject(error);
//             });
            
//             req.write(payload);
//             req.end();
//         } catch (error) {
//             reject(error);
//         }
//     });
// }

// const facebookAuth = {};

// facebookAuth.verify = async (idToken) => {
//     const user = await getUserProfile(idToken);
//     return {
//         facebookID: user.id,
//         name: user.name,
//         profilePicture: user.picture.data.url,
//         email: user.email,
//         gender: user.gender,
//         dateOfBirth: user.birthday
//     };
// }

// module.exports = facebookAuth;