import { IUser } from "../../src/models/users";

declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}