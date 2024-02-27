import express from 'express';
import * as jwt from "jsonwebtoken";
import { UserModel } from "../models/users";
import { Result } from "helpers";

export const IsAuthenticated = (
    async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        let token;
        if (
            req.headers.authorization.startsWith("Bearer") &&
            req.headers.authorization
        ) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            return res.status(401).json({
                success: true,
                error: "Not autorized to access this route",
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET as jwt.Secret);
        const [error, user] = await Result(UserModel.findById((<any>decoded).id));
        if (error) {
            return res.status(401).json({
                success: true,
                error: error.message,
            });
        }
        if (user) {
            req.user = user;
            next();
        }
        else {
            return res.status(401).json({
                success: true,
                error: "Token user does not exists",
            });
        }


    }
);