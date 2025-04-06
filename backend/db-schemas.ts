import mongoose from "mongoose";

export const despatchSchema = new mongoose.Schema({
    docUUID: { type: String, required: true, unique: true },
    despatchId: { type: String, required: true },
    xml: {type: String, required: true },
}, { timestamps: true });

export const DespatchAdviceModel = mongoose.model('DespatchAdvice', despatchSchema);