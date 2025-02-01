import { model, Schema } from "mongoose";

export default model("users", new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    permissions: {
        type: Number,
        required: true,
        default: 0
    }
}));