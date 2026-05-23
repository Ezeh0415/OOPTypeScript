import { UserModel } from "../../Model/UserSchema";
import { IUser } from "../../Model/UserSchema"
import bcrypt from 'bcryptJs';


export class AuthService {
    private static instance: AuthService;
    private user = UserModel;
    private readonly SALT_ROUNDS = 10;


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
            refreshToken: userData.refreshToken,
        }

        const user = new this.user(newUser);
        return await user.save();
    }
}