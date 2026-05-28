import { TokenService } from "../../../../Middleware/JwtConfig/GetJwtToken";
import { GUser } from "../../../../Middleware/Passport.ts/Passport";
import { OtpService } from "../../../../Utils/GenerateOtp/OtpGenerate";
import { UserModel } from "../../Model/UserSchema";
import { IUser } from "../../Model/UserSchema"
import bcrypt from 'bcryptJs';


export class AuthService {
    private static instance: AuthService;
    private user = UserModel;
    private readonly SALT_ROUNDS = 10;
    private tokenService = TokenService.getInstance();
    private otpService = OtpService.getInstance();




    private constructor() { }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService()
        }
        return AuthService.instance;
    }

    private async isUserExists(email: string): Promise<IUser | null> {
        try {
            const user = await this.user.findOne({ email });
            return user as IUser | null;
        } catch (error) {
            console.error('Error checking user existence:', error);
            return null;
        }
    }

    async register(userData: Partial<IUser>): Promise<IUser> {
        const email = userData?.email;

        const existingUser = await this.isUserExists(email as string);

        if (existingUser) {
            throw new Error("user already exists");
        }

        // otp 
        const number = 6
        const otp = await this.otpService.NewOtp(number as number);

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password as string, this.SALT_ROUNDS);

        const newUser = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: hashedPassword,
            otp: otp,
            otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
        }

        const user = new this.user(newUser);
        const token = await this.tokenService.getRefreshJwtToken(user?._id, user?.email);
        user.refreshToken = token;
        await user.save();
        return user;


    }

    async login(userData: Partial<IUser>): Promise<IUser> {
        const email = userData.email;

        const isExist = await this.isUserExists(email as string);

        if (!isExist) {
            throw new Error("user dose not exist ");
        }

        if (isExist.lockedUntil && isExist.lockedUntil > new Date()) {
            const remainingMinutes = Math.ceil((isExist.lockedUntil.getTime() - Date.now()) / 60000);
            throw new Error(`Account is locked. Please try again in ${remainingMinutes} minutes`)
        }

        if (isExist.loginFailedCount >= 5) {
            isExist.lockedUntil = new Date(Date.now() + 10 * 60 * 1000); // Lock for 10 minutes
            isExist.loginFailedCount = 0 //lock count reset
            await isExist.save();

            throw new Error(`Too many failed attempts. Account locked until ${isExist.lockedUntil}`);
        }

        const password = userData.password;
        const dbPassword = isExist?.password;

        const isPasswordValid = await bcrypt.compare(password as string, dbPassword as string);

        if (!isPasswordValid) {
            isExist.loginFailedCount = (isExist.loginFailedCount || 0) + 1;
            isExist.save();
            throw new Error("password does not match");
        }

        const token = await this.tokenService.getRefreshJwtToken(isExist?._id, isExist?.email);
        isExist.refreshToken = token;
        isExist.loginFailedCount = 0 //lock count reset
        isExist.save();

        return isExist;

    }

    async otpValidate(userData: Partial<IUser>): Promise<boolean> {
        const email = userData.email;
        const otp = userData.otp;

        const isExist = await this.isUserExists(email as string);

        if (!isExist) {
            throw new Error('error user not found');
        }


        const otpExpiry = isExist.otpExpiry ? new Date(isExist.otpExpiry) : null;
        const currentTime = new Date();

        if (!otpExpiry || otpExpiry < currentTime) {
            await this.user.updateOne(
                { _id: isExist._id },
                { $set: { otp: "", otpExpiry: "", otpAdded: false } }
            );
            throw new Error('OTP has expired');
        }

        if (!otp || isExist.otp !== otp) {
            await this.user.updateOne(
                { _id: isExist._id },
                { $set: { otp: "", otpExpiry: "", otpAdded: false } }
            );
            throw new Error('invalid otp');
        }

        await this.user.updateOne(
            { _id: isExist._id },
            { $set: { otp: "", otpExpiry: "", otpAdded: true } }
        );

        return true;

    }

    async resendOtp(email: string): Promise<boolean> {

        const isExist = await this.isUserExists(email as string);

        if (!isExist) {
            throw new Error("user not found ");
        }

        const newOtp = await this.otpService.NewOtp(6);

        if (!newOtp) {
            throw new Error("otp error");
        }

        await this.user.updateOne(
            { _id: isExist._id },
            { $set: { otp: newOtp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000), otpAdded: false } }
        )

        return true;
    }

    async ForgotPassword(email: string): Promise<boolean> {
        const isExist = await this.isUserExists(email as string);

        if (!isExist) {
            throw new Error("check your email nd try again");
        }

        const newOtp = await this.otpService.NewOtp(6);

        await this.user.updateOne(
            { _id: isExist._id },
            { $set: { otp: newOtp, otpAdded: false, otpExpiry: new Date(Date.now() + 10 * 60 * 1000) } }
        )

        // setup email and send token 

        return true;
    }

    async resetPassword(userData: Partial<IUser>): Promise<boolean> {
        const { email, password, otp } = userData;

        const user = await this.isUserExists(email as string);

        if (!user) {
            throw new Error("user not found");
        }

        // 1. Verify OTP first (usually cheaper than bcrypt)
        if (user.otp !== otp) {
            throw new Error("invalid otp");
        }

        // 2. Check if new password is same as old password
        const isSameAsOld = await bcrypt.compare(password as string, user.password);

        if (isSameAsOld) {
            throw new Error("new password cannot be the same as old password");
        }

        // 3. Hash the new password
        const hashPassword = await bcrypt.hash(password as string, this.SALT_ROUNDS);

        // 4. Update user
        await this.user.updateOne(
            { _id: user._id },
            { $set: { password: hashPassword, otp: "", otpAdded: true, otpExpiry: "" } }
        );

        return true;
    }

    async googleRegister(userData: GUser): Promise<IUser> {
        const isExist = await this.isUserExists(userData.email as string);

        if (!isExist) {
            throw new Error("user not found ");
        }

        const id = isExist?._id as  object
        const email = isExist?.email as string

        const refreshToken = await this.tokenService.getJwtToken(id, email);

        isExist.refreshToken = refreshToken;
        isExist.save();

        return isExist;
    }
}