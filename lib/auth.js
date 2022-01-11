import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/mongoose/user.js";
import objectHash from "../lib/objectHash.js";

const checkToken = token => {
    if (!token) { return null }
    // Set JWT_SECRET to correct value based on the subject claim of the
    // incoming jwt
    let JWT_SECRET
    switch (jwt.decode(token).sub) {
        case "REFRESH_TOKEN":
            JWT_SECRET = process.env.JWT_SECRET_REFRESH_TOKEN
            break
        case "ACCESS_TOKEN":
            JWT_SECRET = process.env.JWT_SECRET_ACCESS_TOKEN
            break
        default:
            JWT_SECRET = null
    }

    try {
        // jwt token verification performed synchronously if no callback
        // is passed - therefore call is wrapped in a try catch block
        // in case jwt.verify() throws an error
        return jwt.verify(token, JWT_SECRET)
    } catch {
        return null
    }
}

// The method we use to create/sign the JWT
const generateAccessToken = args => {
    const payload = {
        _id: args._id,
        nonce: crypto.randomBytes(32).toString("hex")
    }
    const payloadHash = objectHash(payload)
    const token = jwt.sign(
        { ...payload },
        process.env.JWT_SECRET_ACCESS_TOKEN,
        {
            algorithm: "HS256",
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE,
            subject: "ACCESS_TOKEN",
            expiresIn: "1h",
            jwtid: payloadHash
        }
    )
    return { token: token, payloadHash: payloadHash }
}

// The method we use to create/sign the JWT
const generateRefreshToken = args => {
    const payload = {
        _id: args._id.toString(),
        nonce: crypto.randomBytes(32).toString("hex")
    }
    const payloadHash = objectHash(payload)
    const token = jwt.sign(
        { ...payload },
        process.env.JWT_SECRET_REFRESH_TOKEN,
        {
            algorithm: "HS256",
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE,
            subject: "REFRESH_TOKEN",
            // Amount of time equivalent to browser update cycle, at which time,
            // the clientHash of the user will change due to browser update,
            // and the user will have to revalidate themselves anyway
            expiresIn: "42d",
            jwtid: payloadHash
        }
    )
    return { token: token, payloadHash: payloadHash }
}

const addUser = async (req, res, next) => {
    const accessToken = req.cookies["access-token"];

    if (!accessToken) return next();

    let token = checkToken(accessToken);

    if (!token) {
        const refreshToken = req.cookies["refresh-token"];

        if (!refreshToken) return next();

        const rToken = checkToken(refreshToken);
        if (!rToken) return next();

        const user = await User.findOne({ _id: rToken._id });
        if (!user) return next();

        const refreshTokenJTI = jwt.decode(refreshToken).jti;

        let hasRefreshToken = false;
        user.refreshTokens.map(tkn => {
            if (tkn.tokenJti === refreshTokenJTI) hasRefreshToken = true;
        })

        if (!hasRefreshToken) return next();

        const accessToken = generateAccessToken({ _id: user._id });

        res.cookie("access-token", accessToken.token, { httpOnly: true, });

        token = checkToken(accessToken.token);
    }

    const user = await User.findOne({ _id: token._id });

    if (!user) return next();

    req.user = user;
    return next();
}

export { addUser }