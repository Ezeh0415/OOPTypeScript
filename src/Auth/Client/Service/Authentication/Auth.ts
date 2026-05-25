import { TokenService } from "../../../../Middleware/JwtConfig/GetJwtToken";
import { UserModel } from "../../Model/UserSchema";
import { IUser } from "../../Model/UserSchema"
import bcrypt from 'bcryptJs';


export class AuthService {
    private static instance: AuthService;
    private user = UserModel;
    private readonly SALT_ROUNDS = 10;
    private tokenService = TokenService.getInstance();




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

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password as string, this.SALT_ROUNDS);

        const newUser = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: hashedPassword,
        }

        const user = new this.user(newUser);
        const token = await this.tokenService.getRefreshJwtToken(user?._id, user?.email);
        user.refreshToken = token;
        await user.save();
        return user;

        //  Generate token AFTER user has _id


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
}