// import { Config } from "../../Config/DevConfig";
// import passport from 'passport';
// import { Strategy as GoogleStrategy } from 'passport-google-oauth20';


// export interface GUser {
//     googleId: string;
//     name: string;
//     email: string;
//     password: string;
//     otpAdded: boolean;
// }

// export interface PassportUseMethod {
//     ["passport.use"](): Promise<void>;
// }

// export class PassportConfigure implements PassportUseMethod {
//     private config: Config;

//     private constructor() {
//         this.config = Config.getInstance();
//     }

//     async ["passport.use"](): Promise<void> {
//         passport.use(new GoogleStrategy({
//             clientID: this.config.GOOGLE_CLIENT_ID!,
//             clientSecret: this.config.GOOGLE_CLIENT_SECRET!,
//             callbackURL: '/api/Ts/v1/google/callback',
//             scope: ['profile', 'email']
//         }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
//             try {
//                 let isExistingUser = await UserModel.findOne({ 
//                     email: profile.emails?.[0]?.value 
//                 });

//                 if (isExistingUser) {
//                     if (!isExistingUser.googleId) {
//                         isExistingUser.googleId = profile.id;
//                         await isExistingUser.save();
//                     }
//                     return done(null, isExistingUser);
//                 }

//                 const randomPassword = Math.random().toString(36).slice(-16) + 
//                                       Math.random().toString(36).slice(-16);

//                 const user: GUser = {
//                     googleId: profile.id,
//                     name: profile.displayName,
//                     email: profile.emails?.[0]?.value,
//                     password: randomPassword,
//                     otpAdded: true
//                 };

//                 const createdUser = await UserModel.create(user);
//                 return done(null, createdUser);
//             } catch (error) {
//                 return done(error as Error);
//             }
//         }));
//     }

//     public initialize(): passport.PassportStatic {
//         return passport;
//     }

//     public static getInstance(): PassportConfigure {
//         return new PassportConfigure();
//     }
// }

// // Export singleton instance
// export const passportConfigure = PassportConfigure.getInstance();
// export default passport;