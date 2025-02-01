import { model, Schema } from "mongoose";

export default model("servers", new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    ip: {
        type: String,
        required: true
    },
    port: {
        type: Number,
        required: true,
        default: 19132
    }
}));