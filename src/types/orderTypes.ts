/**
 * The address structure used in UBL documents
 */
export interface UBLAddress {
    streetName: string;
    buildingName: string;
    buildingNumber: string;
    cityName: string;
    postalZone: string;
    countrySubentity: string;
    addressLine: string;
    countryCode: string;
}

/**
 * Represents a single <cac:OrderLine> from the UBL Order.
 */
export interface UBLOrderLine {
    lineId: string;
    salesOrderLineId: string;
    lineStatusCode: string;
    quantity: string;
    quantityUnitCode: string;
    lineExtensionAmount: string;
    itemName: string;
    itemDescription: string;
    buyersItemId: string;
    sellersItemId: string;
}

/**
 * The main shape of the data we parse from the UBL Order.
 */
export interface ParsedOrder {
    orderId: string;
    salesOrderId: string;
    orderUUID: string;
    orderIssueDate: string;
    note: string;

    buyerAccountId: string;
    buyerName: string;
    buyerAddress: UBLAddress | null;

    sellerAccountId: string;
    sellerName: string;
    sellerAddress: UBLAddress | null;

    deliveryAddress: UBLAddress | null;
    requestedDeliveryStartDate: string;
    requestedDeliveryEndDate: string;

    orderLine: UBLOrderLine | null;
}
