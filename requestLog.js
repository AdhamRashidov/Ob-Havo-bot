import { Schema, model } from "mongoose";

const RequestSchema = new Schema({
    userId: { type: Number, required: true },
    userName: { type: String, required: true },
    message: {type: String, required: true},
    date: { type: Date, default: Date.now }
}, { versionKey: false });

const Request = model('Request', RequestSchema);
export default Request;