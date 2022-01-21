import jwt from "jsonwebtoken";
import { User } from "@model/user.model";
import { Database } from "@lib/db-connection";

export interface TokenPayload {
  sub: string | number;
  name: string;
}

export class TokenHelper {
  private accessTokenSecret: jwt.Secret = process.env.JWT_ACCESS_TOKEN_SECRET as string;
  private refreshTokenSecret: jwt.Secret = process.env.JWT_REFRESH_TOKEN_SECRET as string;
  private accessTokenExpiryTime = process.env.JWT_EXPIRY_TIME;

  constructor(private db: Database) {}

  createAccessToken = (payload: TokenPayload) => {
    return new Promise(async (resolve, reject) => {
        try {
            var token = await jwt.sign({ sub: payload.sub, name: payload.name }, this.accessTokenSecret, { expiresIn: this.accessTokenExpiryTime });
            resolve(token);
          } catch (error) {
            reject(error);
          }
    });
  }

  createRefreshToken = (payload: TokenPayload) => {
    return new Promise(async (resolve, reject) => {
        try {
            var token = await jwt.sign({ sub: payload.sub, name: payload.name }, this.refreshTokenSecret);
            resolve(token);
          } catch (error) {
            reject(error);
          }
    });
  }

  verifyAccessToken = (accessToken: string) => {
    return new Promise((resolve, reject) => {
      try {
        jwt.verify(accessToken, this.accessTokenSecret, (err, decode) => {
          if (err) {
            reject(err);
          } else {
            resolve(decode);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  refreshAccessToken = (refreshToken: string) => {
    return new Promise((resolve, reject) => {
      this.db.executeProc("sdbVerifyUserRefreshToken", { refreshToken }, User, async (error, user: User) => {      
        if (!error) {
            try {
              const accessToken = await token.createAccessToken({ sub: user.userID, name: user.name });
              resolve({ accessToken });
            } catch (error) {
              reject(error);
            }
        } else {
            reject(error);
        }
      });
    });
  }
}