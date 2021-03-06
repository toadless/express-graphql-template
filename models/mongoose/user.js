import mongoose from "mongoose"
import refreshToken from "./refreshToken.js"

export default mongoose.model("user", new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    creationDate: { type: Date, required: true },
    lastUpdated: { type: Date, required: true },

    refreshTokens: { type: [refreshToken], unique: true, required: true, default: [] },
}))