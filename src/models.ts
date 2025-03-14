const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// PostalAddress Schema
const PostalAddressSchema = new Schema({
    streetName: { type: String },
    buildingName: { type: String },
    buildingNumber: { type: String },
    cityName: { type: String },
    postalZone: { type: String },
    countrySubentity: { type: String },
    addressLine: { type: String },
    countryIdentificationCode: { type: String }
}, { _id: false });

// TaxScheme Schema
const TaxSchemeSchema = new Schema({
    registrationName: { type: String },
    companyId: { type: String },
    exemptionReason: { type: String },
    taxTypeCode: { type: String }
}, { _id: false });

// ContactInfo Schema
const ContactInfoSchema = new Schema({
    name: { type: String },
    telephone: { type: String },
    telefax: { type: String },
    electronicMail: { type: String }
}, { _id: false });

// Party Schema
const PartySchema = new Schema({
    customerAssignedAccountId: { type: String },
    supplierAssignedAccountId: { type: String },
    partyName: { type: String },
    postalAddress: { type: PostalAddressSchema },
    taxScheme: { type: TaxSchemeSchema },
    contactInfo: { type: ContactInfoSchema }
}, { _id: false });

// Quantity Schema
const QuantitySchema = new Schema({
    value: { type: Number, required: true },
    unitCode: { type: String, required: true }
}, { _id: false });

// OrderReference Schema
const OrderReferenceSchema = new Schema({
    orderId: { type: String, required: true },
    salesOrderId: { type: String },
    uuid: { type: String },
    issueDate: { type: Date }
}, { _id: false });

// LotIdentification Schema
const LotIdentificationSchema = new Schema({
    lotNumberId: { type: String, required: true },
    expiryDate: { type: Date }
}, { _id: false });

// ItemInstance Schema
const ItemInstanceSchema = new Schema({
    lotIdentification: { type: LotIdentificationSchema, required: true }
}, { _id: false });

// Item Schema
const ItemSchema = new Schema({
    description: { type: String, required: true },
    name: { type: String, required: true },
    buyersItemIdentification: { type: String },
    sellersItemIdentification: { type: String }
}, { _id: false });

// OrderLineReference Schema
const OrderLineReferenceSchema = new Schema({
    lineId: { type: String, required: true },
    salesOrderLineId: { type: String },
    orderReference: { type: OrderReferenceSchema, required: true }
}, { _id: false });

// DespatchLine Schema
const DespatchLineSchema = new Schema({
    lineId: { type: String, required: true },
    note: { type: String },
    lineStatusCode: { type: String },
    deliveredQuantity: { type: QuantitySchema, required: true },
    backorderQuantity: { type: QuantitySchema },
    backorderReason: { type: String },
    orderLineReference: { type: OrderLineReferenceSchema, required: true },
    item: { type: ItemSchema, required: true },
    itemInstance: { type: ItemInstanceSchema, required: true }
}, { _id: false });

// RequestedDeliveryPeriod Schema
const RequestedDeliveryPeriodSchema = new Schema({
    startDate: { type: Date },
    startTime: { type: String },
    endDate: { type: Date },
    endTime: { type: String }
}, { _id: false });

// Delivery Schema
const DeliverySchema = new Schema({
    deliveryAddress: { type: PostalAddressSchema, required: true }
}, { _id: false });

// Consignment Schema
const ConsignmentSchema = new Schema({
    consignmentId: { type: String, required: true }
}, { _id: false });

// Shipment Schema
const ShipmentSchema = new Schema({
    shipmentId: { type: String, required: true },
    consignment: { type: ConsignmentSchema, required: true },
    delivery: { type: DeliverySchema, required: true },
    requestedDeliveryPeriod: { type: RequestedDeliveryPeriodSchema, required: true }
}, { _id: false });

// HealthCheck Schema
const HealthCheckSchema = new Schema({
    serviceName: { type: String, required: true },
    status: { type: String, required: true },
    lastCheckedAt: { type: Date, required: true },
    dbStatus: { type: String, required: true },
    uptimePercent: { type: Number, required: true }
}, { _id: false });

// DespatchAdvice Schema
const DespatchAdviceSchema = new Schema({
    orderId: { type: String, required: true, index: true },
    ublVersionId: { type: String, required: true },
    customizationId: { type: String, required: true },
    profileId: { type: String, required: true },
    documentId: { type: String, required: true, unique: true },
    copyIndicator: { type: Boolean, required: true },
    uuid: { type: String, required: true, unique: true },
    issueDate: { type: Date, required: true },
    documentStatusCode: { type: String, required: true, index: true },
    despatchAdviceTypeCode: { type: String, required: true },
    note: { type: String },
    previousVersionId: { type: String },
    currentVersionId: { type: String },
    orderReference: { type: OrderReferenceSchema, required: true },
    despatchSupplierParty: { type: PartySchema, required: true },
    deliveryCustomerParty: { type: PartySchema, required: true },
    shipmentDetails: { type: ShipmentSchema, required: true },
    despatchLines: { type: [DespatchLineSchema], required: true },
    HealthCheck: { type: HealthCheckSchema, required: true }
}, { timestamps: true });

module.exports = mongoose.model('DespatchAdvice', DespatchAdviceSchema);
