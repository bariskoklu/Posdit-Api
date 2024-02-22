import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { ErrorResponse } from "../utils/errorResponse";
import { UserModel } from "../models/users";

export const protect = (
    async (req: any, res: Response, next: NextFunction) => {
        let token;

        if (
            req.headers.authorization.startsWith("Bearer") &&
            req.headers.authorization
        ) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            return next(new ErrorResponse("Not autorized to access this route", 401));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as jwt.Secret);
            req.user = await UserModel.findById((<any>decoded).id);
            next();
        } catch (err) {
            return next(new ErrorResponse("Not autorized to access this route", 401));
        }
    }
);