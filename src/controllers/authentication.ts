import express from 'express';
import { RegisterDTO, LoginDto } from '../dtos/userdto';
import { UserModel } from '../models/users';
import { Result, authentication, random } from '../helpers';
import { ErrorResponse } from '../utils/errorResponse';

export const register = async (req: express.Request, res: express.Response) => {
    const registerDTO: RegisterDTO = req.body;

    if (!registerDTO.email || !registerDTO.password || !registerDTO.username) {
        return new ErrorResponse("Please provide an email, a password and a username", 400);
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
        return new ErrorResponse(error.message, 400);
    }

    return res.status(200).json({
        success: true,
        data: user,
    });
}

// export const login =
//     async (req: express.Request, res: express.Response) => {
//         const loginDto: LoginDto = req.body;

//         if (!loginDto.email || !loginDto.password) {
//             return new ErrorResponse("Please provide an email and a password", 400);
//         }

//         const user = await User.findOne({ email }).select("+password");

//         if (!user) {
//             return next(new ErrorResponse("Invalid credentials", 401));
//         }

//         const isMatch = await user.matchPassword(password);

//         if (!isMatch) {
//             return next(new ErrorResponse("Invalid credentials", 401));
//         }

//         sendTokenResponse(user, 200, res);
//     }