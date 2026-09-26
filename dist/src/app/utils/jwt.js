import jwt from 'jsonwebtoken';
const createToken = (jwtPayload, secret, expiresIn) => {
    const token = jwt.sign(jwtPayload, secret, expiresIn);
    return token;
};
const varifyToken = (token, secret) => {
    try {
        const varifiedToken = jwt.verify(token, secret);
        return {
            success: true,
            data: varifiedToken
        };
    }
    catch (error) {
        console.log("Token varification failed :", error);
        return {
            success: false,
            error: error.message
        };
    }
};
export const jwtUtiles = {
    createToken,
    varifyToken
};
