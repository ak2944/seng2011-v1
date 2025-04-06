import { XMLParser } from 'fast-xml-parser';
import { ParsedOrder, UBLAddress, UBLOrderLine } from './types/orderTypes';
import { UBLRawOrderLine, UBLRawOrderRoot, UBLRawPostalAddress } from './types/UBLTypes';

/**
 * parseOrderXml - parses raw XML of a UBL Order into a `ParsedOrder`.
 * Throws an error if invalid or missing fields.
 */
export function parseOrderXml(orderXml: string): ParsedOrder {
    const parser = new XMLParser({ ignoreAttributes: false, ignoreDeclaration: false,
    });
    const obj = parser.parse(orderXml) as UBLRawOrderRoot;

    if (!obj.Order) {
        throw new Error('XML is not a valid UBL Order.');
    }

    const order = obj.Order;

    // Build the typed object
    const parsedOrder: ParsedOrder = {
        // High-level Order info
        orderId: order['cbc:ID'] || '',
        salesOrderId: order['cbc:SalesOrderID'] || '',
        orderUUID: order['cbc:UUID'] || '',
        orderIssueDate: order['cbc:IssueDate'] || '',
        note: order['cbc:Note'] || '',

        // Buyer info
        buyerAccountId: order['cac:BuyerCustomerParty']?.['cbc:CustomerAssignedAccountID'] || '',
        buyerName: order['cac:BuyerCustomerParty']?.['cac:Party']?.['cac:PartyName']?.['cbc:Name'] || '',
        buyerAddress: extractAddress(
            order['cac:BuyerCustomerParty']?.['cac:Party']?.['cac:PostalAddress']
        ),

        // Seller info
        sellerAccountId: order['cac:SellerSupplierParty']?.['cbc:CustomerAssignedAccountID'] || '',
        sellerName: order['cac:SellerSupplierParty']?.['cac:Party']?.['cac:PartyName']?.['cbc:Name'] || '',
        sellerAddress: extractAddress(
            order['cac:SellerSupplierParty']?.['cac:Party']?.['cac:PostalAddress']
        ),

        // Delivery info
        deliveryAddress: extractAddress(order['cac:Delivery']?.['cac:DeliveryAddress']),
        requestedDeliveryStartDate: order['cac:Delivery']?.['cac:RequestedDeliveryPeriod']?.['cbc:StartDate'] || '',
        requestedDeliveryEndDate: order['cac:Delivery']?.['cac:RequestedDeliveryPeriod']?.['cbc:EndDate'] || '',

        // Single order line
        orderLine: extractOrderLine(order['cac:OrderLine']),
    };

    return parsedOrder;
}

/**
 * Utility: extractAddress from a <cac:PostalAddress> node.
 */
function extractAddress(addressNode: UBLRawPostalAddress | undefined): UBLAddress | null {
    if (!addressNode) return null;
    return {
        streetName: addressNode['cbc:StreetName'] || '',
        buildingName: addressNode['cbc:BuildingName'] || '',
        buildingNumber: addressNode['cbc:BuildingNumber'] || '',
        cityName: addressNode['cbc:CityName'] || '',
        postalZone: addressNode['cbc:PostalZone'] || '',
        countrySubentity: addressNode['cbc:CountrySubentity'] || '',
        addressLine: addressNode['cac:AddressLine']?.['cbc:Line'] || '',
        countryCode: addressNode['cac:Country']?.['cbc:IdentificationCode'] || '',
    };
}

/**
 * Utility: extract the first <cac:OrderLine> from the Order.
 */
function extractOrderLine(orderLineNode: UBLRawOrderLine | UBLRawOrderLine[] | undefined): UBLOrderLine | null {
    if (!orderLineNode) return null;

    const lineObj = Array.isArray(orderLineNode) ? orderLineNode[0] : orderLineNode;
    const lineItem = lineObj['cac:LineItem'];
    if (!lineItem) return null;

    const parsedLine: UBLOrderLine = {
        lineId: lineItem['cbc:ID'] || '',
        salesOrderLineId: lineItem['cbc:SalesOrderID'] || '',
        lineStatusCode: lineItem['cbc:LineStatusCode'] || '',
        quantity: lineItem['cbc:Quantity']?.['#text'] || '',
        quantityUnitCode: lineItem['cbc:Quantity']?.['@unitCode'] || '',
        lineExtensionAmount: lineItem['cbc:LineExtensionAmount']?.['#text'] || '',
        itemName: lineItem['cac:Item']?.['cbc:Name'] || '',
        itemDescription: lineItem['cac:Item']?.['cbc:Description'] || '',
        buyersItemId: lineItem['cac:Item']?.['cac:BuyersItemIdentification']?.['cbc:ID'] || '',
        sellersItemId: lineItem['cac:Item']?.['cac:SellersItemIdentification']?.['cbc:ID'] || '',
    };

    return parsedLine;
}
