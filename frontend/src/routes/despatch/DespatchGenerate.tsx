import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { BACKEND, post } from "../..//util/api"
import { useRef, useState } from "react"
import React from "react"
import { EmailShareButton, EmailIcon } from 'react-share'
import { jsPDF } from "jspdf"

interface ParsedOrder {
    orderId: string
    salesOrderId: string
    orderUUID: string
    orderIssueDate: string
    note: string

    buyerAccountId: string
    buyerName: string
    buyerAddress: string

    sellerAccountId: string
    sellerName: string
    sellerAddress: string

    deliveryAddress: string

    orderLine: string

}

interface UserOverrides {
    despatchId: string
    despatchUUID: string 
    deliveredQuantity: string 
    backorderQuantity: string 
    backorderReason: string
    shipmentStartDate: string 
    shipmentEndDate: string 
    despatchLineNote: string 
    lotNumberID: string 
    lotExpiryDate: string 
}

export default function DespatchAdviceGenerator() {
    const [xmlFile, setXmlFile] = useState<File | null>(null)
    const [orderId, setOrderId] = useState("")
    const [parsedOrder, setParsedOrder] = useState<ParsedOrder | null>(null)
    const [overrides, setOverrides] = useState<UserOverrides>({
    despatchId: "",
    despatchUUID: "", 
    deliveredQuantity: "", 
    backorderQuantity: "", 
    backorderReason: "",
    shipmentStartDate: "", 
    shipmentEndDate: "", 
    despatchLineNote: "", 
    lotNumberID: "", 
    lotExpiryDate: "", 
    })

    const [generatedXml, setGeneratedXml] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length == 0) {
            setXmlFile(null)
            return
        }
        setXmlFile(e.target.files[0])
    }

    const handleParseXml = async () => {
        if (!xmlFile) return 

        try {

        const fileText = await xmlFile.text();
        const response = await fetch(`${BACKEND}/order/parse`, {
            method: "POST",
            headers: { "Content-Type": "application/xml" },
            body: fileText,
        });

        if (!response.ok) {
            throw new Error("Failed to parse XML");
        }

        const res = await response.json();
        setParsedOrder(res.parsedOrder);
        } catch (err) {
            console.error("Parse error", err)
            alert("Failed to parse XML")
        }
    }

    const handleOverrideChange = (key: keyof UserOverrides, value: string) => {
        setOverrides(prev => ({ ...prev, [key]: value }))
      }
    
    const handleFetchOrder = async () => {
        if (!orderId.trim()) {
            alert("Please enter an Order ID first")
            return
        }
        try {
            const response = await fetch(
                `https://code-crusaders-q5k9.onrender.com/v1/order/guest/${orderId}`,
                {
                    headers: {Accept: "application/xml"}
                }
            )
        if (!response.ok) {
            throw new 
            Error("Failed to fetch order")
        }

        const xmlText = await response.text()

        const parseRes = await fetch(`${BACKEND}/api/v1/order/parse`, {
            method: "POST",
            headers: { "Content-Type": "application/xml" },
            body: xmlText
          })

    
        if (!parseRes.ok) {
            throw new Error("Failed to parse fetched XML");
        }

        const res = await parseRes.json();
        if (!res.parsedOrder.orderUUID) {
            res.parsedOrder.orderUUID = '111111'
        }
        setParsedOrder(res.parsedOrder);
        
        } catch (err) {
            console.error("Fetch/parse error:", err)
            alert("Error fetching or parsing order.")
        }
    }
      // 4) Generate Despatch Advice
    const handleGenerate = async () => {
        if (!parsedOrder) {
        alert("No parsed order to generate from.")
        return
        }
        try {
        const body = {
            parsedOrder,
            userInputs: overrides
        }
        const res = await fetch(`${BACKEND}/api/v1/despatch-advice/generate`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })
        console.log(parsedOrder)
        const data = await res.text()
        if (!res.ok) {
            alert("Generate error: " + data)
            return
        }
        setGeneratedXml(data) 
        } catch (err) {
        console.error("Generate error:", err)
        alert("Could not generate Despatch Advice")
        }
    }

    const handleDownloadXml = () => {
        if (!generatedXml) return
        const blob = new Blob([generatedXml], { type: "application/xml" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "despatch-advice.xml"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }

    
    const handleConvertToPdf = async () => {

        try {

            const uuid = parsedOrder?.orderUUID
            const pdfRes = await fetch(`${BACKEND}/api/v1/despatch-advice/${uuid}/pdf`)

            if (!pdfRes.ok) {
                throw new Error("Could not fetch PDF")
            }
            
            const pdfBlob = await pdfRes.blob()

            const pdfUrl = URL.createObjectURL(pdfBlob)
            const a = document.createElement("a")
            a.href = pdfUrl
            a.download = `despatch-advice-${uuid}.pdf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(pdfUrl)

        } catch (err) {
            console.error("PDF download error:", err)
            alert("Error fetching PDF from server.")            
        }
    }
    
    return (
        <div className="space-y-4 max-w-xl max-auto p-4">
            <h2 className="text-2xl font-bold">Despatch Advice Generator</h2>

             {/* (A) Upload Step */}
             <div className="space-y-2">
                <input 
                type = "file"
                accept = ".xml"
                ref = {fileInputRef}
                onChange = {handleFileChange}
                className="hidden"
                />
            <Button onClick={() => fileInputRef.current?.click()}>Select XML file</Button>
            {xmlFile && <p>Selected file: {xmlFile.name}</p>}
            <Button variant="outline" onClick={handleParseXml} disabled={!xmlFile}>
                Parse XML
            </Button>

            <div className="flex items-center space-x-2 mt-3">
                <Input
                    placeholder="Enter Order ID"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                />
                <Button onClick={handleFetchOrder}>Fetch Order from API</Button>
            </div>
        </div>

            {/* (B) Display Parsed Fields */}
            {parsedOrder && (
                <div className="border p-4 space-y-2 overflow-y-auto max-h-[70] break-words whitespace-pre-wrap">
                <h3 className="font-semibold">Parsed Order Info</h3>
                <p>orderId: {parsedOrder.orderId}</p>
                <p>salesOrderId: {parsedOrder.salesOrderId}</p>
                <p>orderUUID: {parsedOrder.orderUUID}</p>
                <p>orderIssueDate: {parsedOrder.orderIssueDate}</p>
                <p>note: {parsedOrder.note}</p>
                <p>buyerAccountId: {parsedOrder.buyerAccountId}</p>
                <p>buyerName: {parsedOrder.buyerName}</p>
                <p>sellerAccountId: {parsedOrder.sellerAccountId}</p>
                <p>sellerName: {parsedOrder.sellerName}</p>

                <pre className="break-words whitespace-pre-wrap">
                buyerAddress: {parsedOrder.buyerAddress ? JSON.stringify(parsedOrder.buyerAddress, null, 2) : "N/A"}
                </pre>
                <pre className="break-words whitespace-pre-wrap">
                <p>sellerAddress: {parsedOrder.sellerAddress ? JSON.stringify(parsedOrder.sellerAddress, null, 2): "N/A"}</p>
                </pre>
                <pre className="break-words whitespace-pre-wrap">
                <p>deliveryAddress: {parsedOrder.deliveryAddress ? JSON.stringify(parsedOrder.deliveryAddress, null, 2): "N/A"}</p>
                </pre>
                <pre className="break-words whitespace-pre-wrap">
                <p>orderLine: {parsedOrder.orderLine ? JSON.stringify(parsedOrder.orderLine, null, 2): "N/A"}</p>
                </pre>
                </div>
            )}

            {/* (C) User Overrides Form */}
            {parsedOrder && (
                <div className="space-y-2">
                <h3 className="font-semibold">Overrides</h3>
                <label className="block">
                    despatchId:
                    <Input
                    type="text"
                    value={overrides.despatchId}
                    onChange={(e) => handleOverrideChange("despatchId", e.target.value)}
                    className="mt-1"
                    />
                </label>
                <label className="block">
                    despatchUUID:
                    <Input
                    type="text"
                    value={overrides.despatchUUID}
                    onChange={(e) => handleOverrideChange("despatchUUID", e.target.value)}
                    className="mt-1"
                    />
                </label>
                <label className="block">
                    Delivered Quantity:
                    <Input
                    type="text"
                    value={overrides.deliveredQuantity}
                    onChange={(e) => handleOverrideChange("deliveredQuantity", e.target.value)}
                    className="mt-1"
                    />
                </label>
                <label className="block">
                    Backorder Quantity:
                    <Input
                    type="text"
                    value={overrides.backorderQuantity}
                    onChange={(e) => handleOverrideChange("backorderQuantity", e.target.value)}
                    className="mt-1"
                    />
                </label>
                <label className="block">
                    Backorder Reason:
                    <Input
                    type="text"
                    value={overrides.backorderReason}
                    onChange={(e) => handleOverrideChange("backorderReason", e.target.value)}
                    className="mt-1"
                    />
                </label>
                <label className="block">
                    Shipment StartDate:
                    <Input
                    type="text"
                    value={overrides.shipmentStartDate}
                    onChange={(e) => handleOverrideChange("shipmentStartDate", e.target.value)}
                    className="mt-1"
                    />
                </label>
                <label className="block">
                    Shipment EndDate:
                    <Input
                    type="text"
                    value={overrides.shipmentEndDate}
                    onChange={(e) => handleOverrideChange("shipmentEndDate", e.target.value)}
                    className="mt-1"
                    />
                </label>
                <label className="block">
                    Despatch Line Note:
                    <Input
                    type="text"
                    value={overrides.despatchLineNote}
                    onChange={(e) => handleOverrideChange("despatchLineNote", e.target.value)}
                    className="mt-1"
                    />
                </label>
                <label className="block">
                    Lot Number ID:
                    <Input
                    type="text"
                    value={overrides.lotNumberID}
                    onChange={(e) => handleOverrideChange("lotNumberID", e.target.value)}
                    className="mt-1"
                    />
                </label>
                <label className="block">
                    Lot Expiry Date:
                    <Input
                    type="text"
                    value={overrides.lotExpiryDate}
                    onChange={(e) => handleOverrideChange("lotExpiryDate", e.target.value)}
                    className="mt-1"
                    />
                </label>
                </div>
            )}

            {/* (D) Generate Button */}
            {parsedOrder && (
                <Button className="w-full mt-2" onClick={handleGenerate}>
                Generate Despatch Advice
                </Button>
            )}

            {/* (E) Download or Share the final XML */}
            {generatedXml && (
                <div className="space-y-2 p-4 border rounded-md">
                <h3 className="font-semibold">Despatch Advice Generated!</h3>
                <Button variant="outline" onClick={handleDownloadXml}>
                    Download XML
                </Button>

                <Button variant="outline">
                <EmailShareButton subject="Your Despatch Advice XML" body={generatedXml} separator="" url={""} children={"Email XML"}>
                </EmailShareButton>
                </Button>

                <Button variant="outline" onClick={handleConvertToPdf}>
                Convert to PDF
                </Button>
                <pre className="text-xs bg-gray-100 p-2 overflow-auto mt-2">
                    {generatedXml}
                </pre>
                </div>
            )}
        </div>
    )
}

