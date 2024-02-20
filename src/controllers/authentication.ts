import express from 'express';
import RegisterDTO from '../dtos/userdto';
import { UserModel } from '../models/users';
import { Result, authentication, random } from '../helpers';
import { ErrorResponse } from '../utils/errorResponse';

export const register = async (req: express.Request, res: express.Response) => {
    const registerDTO: RegisterDTO = req.body;

    if (!registerDTO.email || !registerDTO.password || !registerDTO.username) {
        return res.sendStatus(400);
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
        return res.sendStatus(400);
    }

    return res.status(200).json({
        success: true,
        data: user,
    });
}

// export const get = async (req: express.Request<{}, {}, RegisterDTO>, res: express.Response) => {
//     const registerDTO = req.body;

//     await Result(getUserByEmail(registerDTO.email));

//     return res.status(200).json({
//         success: true,
//         data: user,
//     });
// }