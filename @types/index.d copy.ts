import { IUser } from "../../src/models/users";

export { };

declare global {
    namespace Express {
        interface Request {
            user: IUser;
        }
    }
}