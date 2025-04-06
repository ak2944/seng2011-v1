/**
 * This interface matches the shape of `parser.parse(orderXml)`
 * for a UBL Order.
 */
export interface UBLRawOrderRoot {
    // The top-level object has a property named 'Order'
    Order: {
        // Basic order data
        'cbc:ID': string;
        'cbc:SalesOrderID'?: string;
        'cbc:UUID'?: string;
        'cbc:IssueDate'?: string;
        'cbc:Note'?: string;

        // Buyer info
        'cac:BuyerCustomerParty'?: {
            'cbc:CustomerAssignedAccountID'?: string;
            'cac:Party'?: {
                'cac:PartyName'?: {
                    'cbc:Name'?: string;
                };
                'cac:PostalAddress'?: UBLRawPostalAddress;
            };
        };

        // Seller info
        'cac:SellerSupplierParty'?: {
            'cbc:CustomerAssignedAccountID'?: string;
            'cac:Party'?: {
                'cac:PartyName'?: {
                    'cbc:Name'?: string;
                };
                'cac:PostalAddress'?: UBLRawPostalAddress;
            };
        };

        // Delivery info
        'cac:Delivery'?: {
            'cac:DeliveryAddress'?: UBLRawPostalAddress;
            'cac:RequestedDeliveryPeriod'?: {
                'cbc:StartDate'?: string;
                'cbc:EndDate'?: string;
            };
        };

        // Single order line
        'cac:OrderLine'?: UBLRawOrderLine | UBLRawOrderLine[];
    };
}

export interface UBLRawPostalAddress {
    'cbc:StreetName'?: string;
    'cbc:BuildingName'?: string;
    'cbc:BuildingNumber'?: string;
    'cbc:CityName'?: string;
    'cbc:PostalZone'?: string;
    'cbc:CountrySubentity'?: string;
    'cac:AddressLine'?: {
        'cbc:Line'?: string;
    };
    'cac:Country'?: {
        'cbc:IdentificationCode'?: string;
    };
}

export interface UBLRawOrderLine {
    'cbc:Note'?: string;
    'cac:LineItem'?: {
        'cbc:ID'?: string;
        'cbc:SalesOrderID'?: string;
        'cbc:LineStatusCode'?: string;
        'cbc:Quantity'?: {
            '#text'?: string; // The text value
            '@unitCode'?: string; // The attribute
        };
        'cbc:LineExtensionAmount'?: {
            '#text'?: string;
            '@currencyID'?: string;
        };
        'cbc:TotalTaxAmount'?: {
            '#text'?: string;
            '@currencyID'?: string;
        };
        'cac:Item'?: {
            'cbc:Description'?: string;
            'cbc:Name'?: string;
            'cac:BuyersItemIdentification'?: {
                'cbc:ID'?: string;
            };
            'cac:SellersItemIdentification'?: {
                'cbc:ID'?: string;
            };
        };
    };
}
