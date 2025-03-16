import { create } from 'xmlbuilder2';
import { ParsedOrder } from './types/orderTypes';
import { DespatchAdviceUserInputs } from './types/despatchTypes';

/**
 * generateDespatchAdvice
 * Builds a Despatch Advice XML (as a string) from a combination of:
 * - parsedOrder data
 * - user-provided overrides
 */
export function generateDespatchAdvice(
  parsedOrder: ParsedOrder,
  userInputs: DespatchAdviceUserInputs = {}
): string {
    // 1. Extract fields from the parsed order
    const {
        orderId,
        salesOrderId,
        orderUUID,
        orderIssueDate,
        note,

        buyerAccountId,
        buyerName,
        buyerAddress,

        sellerAccountId,
        sellerName,
        sellerAddress,

        deliveryAddress,
        requestedDeliveryStartDate,
        requestedDeliveryEndDate,

        orderLine,
    } = parsedOrder;

    // 2. Additional user overrides (or defaults)
    const despatchId = parsedOrder.orderId;
    const despatchUUID = parsedOrder.orderUUID;
    const deliveredQuantity = userInputs.deliveredQuantity || '';
    const backorderQuantity = userInputs.backorderQuantity || '0';
    const backorderReason = userInputs.backorderReason || 'No backorder needed';
    const shipmentStartDate = userInputs.shipmentStartDate || new Date().toISOString().split('T')[0];
    const shipmentEndDate = userInputs.shipmentEndDate || '';
    const despatchLineNote = userInputs.despatchLineNote || '';
    const lotNumberID = userInputs.lotNumberID || '';
    const lotExpiryDate = userInputs.lotExpiryDate || '';

    // 3. Build XML using xmlbuilder2
    const root = create({ version: '1.0', encoding: 'UTF-8' })
        .ele('DespatchAdvice', {
        xmlns: 'urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2',
        'xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
        'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
        })
        .ele('cbc:UBLVersionID').txt('2.0').up()
        .ele('cbc:CustomizationID')
        .txt('urn:oasis:names:specification:ubl:xpath:DespatchAdvice-2.0:sbs-1.0-draft')
        .up()
        .ele('cbc:ProfileID')
        .txt('bpid:urn:oasis:names:draft:bpss:ubl-2-sbs-despatch-advice-notification-draft')
        .up()
        .ele('cbc:ID').txt(despatchId).up()
        .ele('cbc:CopyIndicator').txt('false').up()
        .ele('cbc:UUID').txt(despatchUUID).up()
        .ele('cbc:IssueDate').txt(orderIssueDate || '2005-06-20').up()
        .ele('cbc:DocumentStatusCode').txt('NoStatus').up()
        .ele('cbc:DespatchAdviceTypeCode').txt('delivery').up()
        .ele('cbc:Note').txt(note || 'sample').up();

    // <cac:OrderReference>
    const orderRef = root.ele('cac:OrderReference');
    orderRef.ele('cbc:ID').txt(orderId).up();
    orderRef.ele('cbc:SalesOrderID').txt(salesOrderId).up();
    orderRef.ele('cbc:UUID').txt(orderUUID).up();
    orderRef.ele('cbc:IssueDate').txt(orderIssueDate).up();

    // <cac:DespatchSupplierParty> from Seller
    const despatchSupplierParty = root.ele('cac:DespatchSupplierParty');
    despatchSupplierParty.ele('cbc:CustomerAssignedAccountID').txt(sellerAccountId).up();
    buildParty(despatchSupplierParty, sellerName, sellerAddress);

    // <cac:DeliveryCustomerParty> from Buyer
    const deliveryCustomerParty = root.ele('cac:DeliveryCustomerParty');
    deliveryCustomerParty.ele('cbc:CustomerAssignedAccountID').txt(buyerAccountId).up();
    // Typically the example includes: <cbc:SupplierAssignedAccountID>GT00978567</cbc:SupplierAssignedAccountID>
    // We can either do userInputs or a default:
    deliveryCustomerParty.ele('cbc:SupplierAssignedAccountID').txt('GT00978567').up();
    buildParty(deliveryCustomerParty, buyerName, buyerAddress);

    // <cac:Shipment>
    const shipment = root.ele('cac:Shipment');
    shipment.ele('cbc:ID').txt('1').up();
    shipment.ele('cac:Consignment').ele('cbc:ID').txt('1').up().up();
    const shipmentDelivery = shipment.ele('cac:Delivery');
    buildDeliveryAddress(shipmentDelivery, deliveryAddress);

    const requestedDeliveryPeriod = shipmentDelivery.ele('cac:RequestedDeliveryPeriod');
    requestedDeliveryPeriod.ele('cbc:StartDate').txt(shipmentStartDate).up();
    requestedDeliveryPeriod.ele('cbc:StartTime').txt('10:30:47.0Z').up();
    requestedDeliveryPeriod.ele('cbc:EndDate').txt(shipmentEndDate).up();
    requestedDeliveryPeriod.ele('cbc:EndTime').txt('10:30:47.0Z').up();

    // <cac:DespatchLine>
    const despatchLine = root.ele('cac:DespatchLine');
    despatchLine.ele('cbc:ID').txt('1').up();
    despatchLine.ele('cbc:Note').txt(despatchLineNote).up();
    despatchLine.ele('cbc:LineStatusCode').txt('NoStatus').up();
    despatchLine.ele('cbc:DeliveredQuantity', { unitCode: orderLine?.quantityUnitCode || 'KGM' })
        .txt(deliveredQuantity).up();
    despatchLine.ele('cbc:BackorderQuantity', { unitCode: orderLine?.quantityUnitCode || 'KGM' })
        .txt(backorderQuantity).up();
    despatchLine.ele('cbc:BackorderReason').txt(backorderReason).up();

    // <cac:OrderLineReference>
    const orderLineRef = despatchLine.ele('cac:OrderLineReference');
    orderLineRef.ele('cbc:LineID').txt(orderLine?.lineId || '1').up();
    orderLineRef.ele('cbc:SalesOrderLineID').txt(orderLine?.salesOrderLineId || 'A').up();

    // Nested <cac:OrderReference>
    const nestedOrderRef = orderLineRef.ele('cac:OrderReference');
    nestedOrderRef.ele('cbc:ID').txt(orderId).up();
    nestedOrderRef.ele('cbc:SalesOrderID').txt(salesOrderId).up();
    nestedOrderRef.ele('cbc:UUID').txt(orderUUID).up();
    nestedOrderRef.ele('cbc:IssueDate').txt(orderIssueDate).up();

    // <cac:Item>
    const item = despatchLine.ele('cac:Item');
    item.ele('cbc:Description').txt(orderLine?.itemDescription || 'Acme beeswax').up();
    item.ele('cbc:Name').txt(orderLine?.itemName || 'beeswax').up();
    item.ele('cac:BuyersItemIdentification').ele('cbc:ID')
        .txt(orderLine?.buyersItemId || '6578489').up().up();
    item.ele('cac:SellersItemIdentification').ele('cbc:ID')
        .txt(orderLine?.sellersItemId || '17589683').up().up();

    // <cac:ItemInstance>
    const itemInstance = item.ele('cac:ItemInstance');
    const lotIdentification = itemInstance.ele('cac:LotIdentification');
    lotIdentification.ele('cbc:LotNumberID').txt(lotNumberID).up();
    lotIdentification.ele('cbc:ExpiryDate').txt(lotExpiryDate).up();

    // Final XML
    return root.end({ prettyPrint: true });
}

/**
 * Helper to build <cac:Party> sub-tree for a Supplier or Customer.
 */
function buildParty(parentNode: any, partyName: string, address?: any) {
    const party = parentNode.ele('cac:Party');
    party.ele('cac:PartyName').ele('cbc:Name').txt(partyName).up().up();

    const postalAddress = party.ele('cac:PostalAddress');
    postalAddress.ele('cbc:StreetName').txt(address?.streetName || '').up();
    postalAddress.ele('cbc:BuildingName').txt(address?.buildingName || '').up();
    postalAddress.ele('cbc:BuildingNumber').txt(address?.buildingNumber || '').up();
    postalAddress.ele('cbc:CityName').txt(address?.cityName || '').up();
    postalAddress.ele('cbc:PostalZone').txt(address?.postalZone || '').up();
    postalAddress.ele('cbc:CountrySubentity').txt(address?.countrySubentity || '').up();

    postalAddress.ele('cac:AddressLine').ele('cbc:Line')
        .txt(address?.addressLine || '')
        .up().up();

    postalAddress.ele('cac:Country').ele('cbc:IdentificationCode')
        .txt(address?.countryCode || '')
        .up().up();

    // We could also add <cac:PartyTaxScheme>, <cac:Contact>, etc. if needed
}

/**
 * Helper to build <cac:DeliveryAddress> inside <cac:Delivery>
 */
function buildDeliveryAddress(deliveryNode: any, address: any) {
    const addr = deliveryNode.ele('cac:DeliveryAddress');
    addr.ele('cbc:StreetName').txt(address?.streetName || '').up();
    addr.ele('cbc:BuildingName').txt(address?.buildingName || '').up();
    addr.ele('cbc:BuildingNumber').txt(address?.buildingNumber || '').up();
    addr.ele('cbc:CityName').txt(address?.cityName || '').up();
    addr.ele('cbc:PostalZone').txt(address?.postalZone || '').up();
    addr.ele('cbc:CountrySubentity').txt(address?.countrySubentity || '').up();

    addr.ele('cac:AddressLine').ele('cbc:Line').txt(address?.addressLine || '').up().up();

    addr.ele('cac:Country').ele('cbc:IdentificationCode')
        .txt(address?.countryCode || '')
        .up().up();
}
