import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import user from "../models/mongoose/user";
import objectHash from "../lib/objectHash";

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