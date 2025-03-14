const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ShipmentDetailsSchema = new Schema({
    despatchDate: { type: Date, required: true },
    carrier: { type: String, required: true },
    trackingNumber: { type: String, required: true }
}, { _id: false });

const DeliveryAddressSchema = new Schema({
    name: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true }
}, { _id: false });

const DespatchSupplierPartySchema = new Schema({
    name: { type: String, required: true },
    address: { type: String, required: true }
}, { _id: false });

const ItemSchema = new Schema({
    orderLineId: { type: String, required: true },
    deliveredQuantity: { type: Number, required: true },
    unitCode: { type: String, required: true }
}, { _id: false });

const DespatchAdviceSchema = new Schema({
    despatchAdviceId: { type: String, required: true, unique: true },
    orderId: { type: String, required: true },
    shipmentDetails: { type: ShipmentDetailsSchema, required: true },
    deliveryAddress: { type: DeliveryAddressSchema, required: true },
    despatchSupplierParty: { type: DespatchSupplierPartySchema, required: true },
    items: { type: [ItemSchema], required: true },
    status: { type: String, default: 'Active' },
    cancellationReason: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('DespatchAdvice', DespatchAdviceSchema);
