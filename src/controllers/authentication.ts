import express from 'express';
import { RegisterDTO, LoginDto } from '../dtos/userdto';
import { IUser, UserModel } from '../models/users';
import { Result, authentication, random } from '../helpers';
import * as jwt from "jsonwebtoken";

export const register = async (req: express.Request, res: express.Response) => {
    const registerDTO: RegisterDTO = req.body;

    if (!registerDTO.email || !registerDTO.password || !registerDTO.username) {
        return res.status(400).json({
            success: true,
            error: "Please provide an email, a password and a username",
        });
    }
    
    const salt = random();
    const passwordWithSalt = authentication(salt, registerDTO.password);
    const [error, user] = await Result(UserModel.create({
        ...registerDTO,
        authentication: {
            salt,
            password: passwordWithSalt,
        }
    }));

    if (error) {
        return res.status(400).json({
            success: true,
            error: error.message,
        });
    }

    return res.status(200).json({
        success: true,
        data: user,
    });
}

export const login = async (req: express.Request, res: express.Response) => {
    const loginDto: LoginDto = req.body;

    if (!loginDto.email || !loginDto.password) {
        return res.status(400).json({
            success: true,
            error: "Please provide an email, a password",
        });
    }

    const [error, user] = await Result(UserModel.findOne({ email: loginDto.email }).select('+authentiication.salt +authentication.password'));

    console.log("token");

    if (error) {
        return res.status(401).json({
            success: true,
            error: error.message,
        });;
    }

    const givenPassword = authentication(user.authentication.salt, loginDto.password);

    console.log(user.authentication.password + " " + givenPassword);

    if (user.authentication.password != givenPassword) {
        return res.status(401).json({
            success: true,
            error: "Invalid Password",
        });;
    }

    return sendTokenResponse(user, 200, res);
};

const sendTokenResponse = (user: IUser, statusCode: number, res: express.Response) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as jwt.Secret, {
        expiresIn: process.env.JWT_EXPIRE,
    });
    const options = {
        expires: new Date(
            Date.now() + +process.env.JWT_COOKIE_EXPIRE! * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: false,
    };
    if (process.env.NODE_ENV === "product") {
        options.secure = true;
    }

    console.log(token);
    return res
        .status(statusCode)
        .cookie("token", token, options)
        .json({ success: true, token });
};