import PDFDocument from 'pdfkit';
import { parseStringPromise } from 'xml2js';

/**
 * Generates a human-readable PDF from Despatch Advice XML.
 *
 * @param xml - The raw Despatch Advice XML string.
 * @returns A Promise that resolves to a Buffer containing the PDF.
 */
export async function generateDespatchAdvicePDF(xml: string): Promise<Buffer> {
    // 1) Parse the XML into a JSON object
    const parsedResult = await parseStringPromise(xml);
    // Assume the root element is "DespatchAdvice"
    const da = parsedResult.DespatchAdvice;
    if (!da) {
        throw new Error('XML does not contain a root <DespatchAdvice> element.');
    }

    // 2) Extract top-level fields
    const id = da['cbc:ID']?.[0] || 'N/A';
    const copyIndicator = da['cbc:CopyIndicator']?.[0] || 'N/A';
    const uuid = da['cbc:UUID']?.[0] || 'N/A';
    const issueDate = da['cbc:IssueDate']?.[0] || 'N/A';
    const docStatusCode = da['cbc:DocumentStatusCode']?.[0] || 'N/A';
    const despatchTypeCode = da['cbc:DespatchAdviceTypeCode']?.[0] || 'N/A';
    const note = da['cbc:Note']?.[0] || '';

    // 3) Extract OrderReference info
    const orderRef = da['cac:OrderReference']?.[0] || {};
    const orderRefId = orderRef['cbc:ID']?.[0] || 'N/A';
    const orderRefSalesID = orderRef['cbc:SalesOrderID']?.[0] || 'N/A';
    const orderRefUUID = orderRef['cbc:UUID']?.[0] || 'N/A';
    const orderRefIssueDate = orderRef['cbc:IssueDate']?.[0] || 'N/A';

    // 4) DespatchSupplierParty
    const dsp = da['cac:DespatchSupplierParty']?.[0] || {};
    const dspCustomerAccountID = dsp['cbc:CustomerAssignedAccountID']?.[0] || 'N/A';
    const dspParty = dsp['cac:Party']?.[0] || {};
    const dspPartyName = dspParty['cac:PartyName']?.[0]?.['cbc:Name']?.[0] || 'N/A';

    // 5) DeliveryCustomerParty
    const dcp = da['cac:DeliveryCustomerParty']?.[0] || {};
    const dcpCustomerAcctID = dcp['cbc:CustomerAssignedAccountID']?.[0] || 'N/A';
    const dcpSupplierAcctID = dcp['cbc:SupplierAssignedAccountID']?.[0] || 'N/A';
    const dcpParty = dcp['cac:Party']?.[0] || {};
    const dcpPartyName = dcpParty['cac:PartyName']?.[0]?.['cbc:Name']?.[0] || 'N/A';

    // 6) Shipment
    const shipment = da['cac:Shipment']?.[0] || {};
    const shipmentId = shipment['cbc:ID']?.[0] || 'N/A';
    const consignment = shipment['cac:Consignment']?.[0] || {};
    const consignmentId = consignment['cbc:ID']?.[0] || 'N/A';
    const shipmentDelivery = shipment['cac:Delivery']?.[0] || {};
    const shipDelAddress = shipmentDelivery['cac:DeliveryAddress']?.[0] || {};
    const shipDelStreetName = shipDelAddress['cbc:StreetName']?.[0] || 'N/A';

    // Also handle start/end date in RequestedDeliveryPeriod
    const reqDelPeriod = shipmentDelivery['cac:RequestedDeliveryPeriod']?.[0] || {};
    const reqDelStartDate = reqDelPeriod['cbc:StartDate']?.[0] || 'N/A';
    const reqDelEndDate = reqDelPeriod['cbc:EndDate']?.[0] || 'N/A';

    // 7) DespatchLine(s) – might be multiple lines
    const despatchLines = da['cac:DespatchLine'] || [];
    const lineSummaries = despatchLines.map((lineObj: never, index: number) => {
        const lineId = lineObj['cbc:ID']?.[0] || `Line ${index + 1}`;
        const lineNote = lineObj['cbc:Note']?.[0] || '';
        const lineStatus = lineObj['cbc:LineStatusCode']?.[0] || 'N/A';
        const deliveredQty = lineObj['cbc:DeliveredQuantity']?.[0] || 'N/A';
        const backorderQty = lineObj['cbc:BackorderQuantity']?.[0] || '0';
        const backorderReason = lineObj['cbc:BackorderReason']?.[0] || '';

        const item = lineObj['cac:Item']?.[0] || {};
        const itemDescription = item['cbc:Description']?.[0] || '';
        const itemName = item['cbc:Name']?.[0] || 'N/A';

        return {
            lineId,
            lineNote,
            lineStatus,
            deliveredQty,
            backorderQty,
            backorderReason,
            itemDescription,
            itemName
        };
    });

    // 8) Create PDF Document
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    const pdfFinished = new Promise<Buffer>((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);
    });

    // Start writing content
    doc.fontSize(18).text('Despatch Advice Details', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`ID: ${id}`, { continued: true }).text(`   UUID: ${uuid}`);
    doc.text(`Copy Indicator: ${copyIndicator}`);
    doc.text(`Issue Date: ${issueDate}`);
    doc.text(`Document Status Code: ${docStatusCode}`);
    doc.text(`Type: ${despatchTypeCode}`);
    if (note) {
        doc.moveDown().text(`Note: ${note}`);
    }
    doc.moveDown();

    // Order Reference
    doc.fontSize(14).text('Order Reference', { underline: true });
    doc.fontSize(12).text(`ID: ${orderRefId}, SalesOrderID: ${orderRefSalesID}`);
    doc.text(`UUID: ${orderRefUUID}`);
    doc.text(`Issue Date: ${orderRefIssueDate}`);
    doc.moveDown();

    // Despatch Supplier
    doc.fontSize(14).text('Despatch Supplier Party', { underline: true });
    doc.fontSize(12).text(`Customer Assigned AccountID: ${dspCustomerAccountID}`);
    doc.text(`Party Name: ${dspPartyName}`);
    doc.moveDown();

    // Delivery Customer
    doc.fontSize(14).text('Delivery Customer Party', { underline: true });
    doc.fontSize(12).text(`Customer Assigned AccountID: ${dcpCustomerAcctID}`);
    doc.text(`Supplier Assigned AccountID: ${dcpSupplierAcctID}`);
    doc.text(`Party Name: ${dcpPartyName}`);
    doc.moveDown();

    // Shipment
    doc.fontSize(14).text('Shipment Details', { underline: true });
    doc.fontSize(12).text(`Shipment ID: ${shipmentId}`);
    doc.text(`Consignment ID: ${consignmentId}`);
    doc.text(`Delivery Address (Street): ${shipDelStreetName}`);
    doc.text(`Requested Delivery Start: ${reqDelStartDate}`);
    doc.text(`Requested Delivery End: ${reqDelEndDate}`);
    doc.moveDown();

    // Despatch Lines
    doc.fontSize(14).text('Despatch Lines', { underline: true });
    if (lineSummaries.length === 0) {
        doc.fontSize(12).text('No despatch lines found.');
    } else {
        lineSummaries.forEach((ls: { lineId: unknown; lineStatus: unknown; deliveredQty: unknown; backorderQty: unknown; backorderReason: unknown; lineNote: unknown; itemName: unknown; itemDescription: unknown; }, idx: number) => {
            doc.moveDown(0.5);
            doc.fontSize(12).text(`Line #${idx + 1} (ID: ${ls.lineId}):`);
            doc.text(`Status: ${ls.lineStatus}`);
            doc.text(`Delivered Qty: ${ls.deliveredQty}`);
            doc.text(`Backorder Qty: ${ls.backorderQty}`);
            if (ls.backorderReason) {
                doc.text(`Backorder Reason: ${ls.backorderReason}`);
            }
            if (ls.lineNote) {
                doc.text(`Line Note: ${ls.lineNote}`);
            }
            doc.text(`Item Name: ${ls.itemName}`);
            doc.text(`Item Description: ${ls.itemDescription}`);
            doc.moveDown(0.5);
        });
    }

    // Finish the PDF
    doc.end();

    return pdfFinished;
}
