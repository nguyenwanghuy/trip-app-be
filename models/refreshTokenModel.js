import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
    refreshToken: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
}, { timestamps: true })

const RefreshTokenModel = mongoose.model('refreshToken', refreshTokenSchema)
export default RefreshTokenModel