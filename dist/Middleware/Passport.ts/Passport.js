"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passportConfigure = exports.PassportConfigure = void 0;
const DevConfig_1 = require("../../Config/DevConfig");
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const UserSchema_1 = require("../../Module/Auth/Client/Model/UserSchema");
class PassportConfigure {
    constructor() {
        this.User = UserSchema_1.UserModel;
        this.config = DevConfig_1.Config.getInstance();
    }
    async ["passport.use"]() {
        passport_1.default.use(new passport_google_oauth20_1.Strategy({
            clientID: this.config.GOOGLE_CLIENT_ID,
            clientSecret: this.config.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/google/callback',
            scope: ['profile', 'email']
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                let isExistingUser = await this.User.findOne({
                    email: profile.emails?.[0]?.value
                });
                if (isExistingUser) {
                    if (!isExistingUser.googleId) {
                        isExistingUser.googleId = profile.id;
                        await isExistingUser.save();
                    }
                    return done(null, isExistingUser);
                }
                const randomPassword = Math.random().toString(36).slice(-16) +
                    Math.random().toString(36).slice(-16);
                const user = {
                    googleId: profile.id,
                    firstName: profile.displayName?.givenName || profile.displayName.split(' ')[0],
                    lastName: profile.displayName?.familyName || profile.displayName.split(' ').slice(1).join(' '),
                    email: profile.emails?.[0]?.value,
                    password: randomPassword,
                    otpAdded: true
                };
                const createdUser = await this.User.create(user);
                return done(null, createdUser);
            }
            catch (error) {
                return done(error);
            }
        }));
    }
    initialize() {
        return passport_1.default;
    }
    static getInstance() {
        return new PassportConfigure();
    }
}
exports.PassportConfigure = PassportConfigure;
// Export singleton instance
exports.passportConfigure = PassportConfigure.getInstance();
exports.default = passport_1.default;
