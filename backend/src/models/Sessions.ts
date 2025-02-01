import { model, Schema } from "mongoose";
import { v4 } from "uuid";

export default model("sessions", new Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        default: () => v4()
    },
    userId: {
        type: String,
        required: true
    },
    createdAt: {
        //UNIX timestamp
        type: Number,
        required: true,
        default: Date.now() / 1000
    },
    expiresAt: {
        //UNIX timestamp
        type: Number,
        required: true,
        default: Date.now() / 1000 + 60 * 60 * 24 * 7
    }
}));