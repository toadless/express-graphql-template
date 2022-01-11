import mongoose from "mongoose"
import refreshToken from "./refreshToken"

export default mongoose.model("user", new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },

    refreshTokens: { type: [refreshToken], unique: true, required: true, default: [] },
}))