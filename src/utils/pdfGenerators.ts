import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

// Extend the jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Types from the form component
interface LoadConfirmationData {
  companyEntity: 'sa' | 'zim';
  currency: 'ZAR' | 'USD';
  customerName: string;
  contactPerson: string;
  contactDetails: string;
  confirmationDate: string;
  loadRefNumber: string;
  vehicleRegNo: string;
  trailerRegNo: string;
  driverName: string;
  pickupAddress: string;
  deliveryAddress: string;
  commodity: string;
  totalWeight: string;
  palletsOrUnits: string;
  rateAmount: string;
  rateUnit: string;
  totalAmount: string;
  paymentTerms: string;
  specialInstructions: string;
  pickupContact: string;
  deliveryContact: string;
  transporterName: string;
  matanuskaRepName: string;
}

// Define types for company details
interface SACompanyDetails {
  name: string;
  address: string;
  regNo: string;
  vatNo: string;
  tel: string;
  regDate: string;
}

interface ZimCompanyDetails {
  name: string;
  address: string;
  tin: string;
  authCode: string;
  taxpayerName: string;
  tradeName: string;
}

// Company details based on entity
const COMPANY_DETAILS: {
  sa: SACompanyDetails;
  zim: ZimCompanyDetails;
} = {
  sa: {
    name: 'Matanuska (Pty) Ltd',
    address: '6 MT ORVILLE STREET\nMIDLANDS ESTATE MIDSTREAM\nGAUTENG, 1692',
    regNo: '2019/542290/07',
    vatNo: '4710136013',
    tel: '011 613 1804',
    regDate: '01/02/1993'
  },
  zim: {
    name: 'Matanuska Distribution (Pvt) Ltd',
    address: '5179 Tamside Close, Nyakamete Industrial Area\nHarare, Zimbabwe',
    tin: '2000321177',
    authCode: '47046057',
    taxpayerName: 'Matanuska Distribution (Pvt) Ltd',
    tradeName: 'Matanuska Distribution (Pvt) Ltd'
  }
};

/**
 * Generate a PDF load confirmation document
 * @param data The load confirmation form data
 * @returns A Promise that resolves to a PDF blob
 */
export const generateLoadConfirmationPDF = async (
  data: LoadConfirmationData
): Promise<Blob> => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Set font for the entire document
  doc.setFont('helvetica');
  
  // Get the correct company details based on entity
  const companyDetails = data.companyEntity === 'sa' 
    ? COMPANY_DETAILS.sa
    : COMPANY_DETAILS.zim;
  
  // Set page margins
  const margin = 20; // 20mm margin
  const pageWidth = doc.internal.pageSize.width;
  const contentWidth = pageWidth - (margin * 2);
  
  // Helper for text wrapping
  const splitText = (text: string, fontSize: number, maxWidth: number): string[] => {
    doc.setFontSize(fontSize);
    return doc.splitTextToSize(text, maxWidth);
  };
  
  // Start Y position
  let yPos = margin;
  
  // Add header with company details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(companyDetails.name, margin, yPos);
  yPos += 7;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  const addressLines = companyDetails.address.split('\n');
  addressLines.forEach(line => {
    doc.text(line, margin, yPos);
    yPos += 5;
  });
  
  // Add remaining company details based on entity
  if (data.companyEntity === 'sa') {
    const saDetails = companyDetails as SACompanyDetails;
    doc.text(`Reg No: ${saDetails.regNo}`, margin, yPos); yPos += 5;
    doc.text(`VAT No: ${saDetails.vatNo}`, margin, yPos); yPos += 5;
    doc.text(`Tel: ${saDetails.tel}`, margin, yPos); yPos += 5;
    doc.text(`Reg Date: ${saDetails.regDate}`, margin, yPos); yPos += 5;
  } else {
    const zimDetails = companyDetails as ZimCompanyDetails;
    doc.text(`TIN: ${zimDetails.tin}`, margin, yPos); yPos += 5;
    doc.text(`Authentication Code: ${zimDetails.authCode}`, margin, yPos); yPos += 5;
    doc.text(`Taxpayer Name: ${zimDetails.taxpayerName}`, margin, yPos); yPos += 5;
    doc.text(`Trade Name: ${zimDetails.tradeName}`, margin, yPos); yPos += 5;
  }
  
  // Add horizontal line
  yPos += 5;
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  // Add document title
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`LOAD CONFIRMATION (${data.currency})`, pageWidth / 2, yPos, { align: 'center' });
  
  // Reset to normal font
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Add form data in sections
  yPos += 10;
  
  // Customer/Transporter section
  doc.text('To:', margin, yPos);
  yPos += 5;
  
  // Make customer details section
  doc.setFont('helvetica', 'bold');
  doc.text(data.customerName, margin + 10, yPos);
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  
  if (data.contactPerson) {
    doc.text(data.contactPerson, margin + 10, yPos);
    yPos += 5;
  }
  
  if (data.contactDetails) {
    doc.text(data.contactDetails, margin + 10, yPos);
    yPos += 5;
  }
  
  // Add date information
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Date of Confirmation:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(data.confirmationDate), 'yyyy-MM-dd'), margin + 50, yPos);
  
  // Load reference
  yPos += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Load Reference Number:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.loadRefNumber, margin + 50, yPos);
  
  // Vehicle details
  yPos += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Vehicle / Truck Reg No:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.vehicleRegNo, margin + 50, yPos);
  
  if (data.trailerRegNo) {
    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Trailer Reg No:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.trailerRegNo, margin + 50, yPos);
  }
  
  // Driver
  yPos += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Driver Name:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.driverName, margin + 50, yPos);
  
  // Addresses
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Pickup Address:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  
  const pickupLines = splitText(data.pickupAddress, 10, contentWidth - 50);
  for (let i = 0; i < pickupLines.length; i++) {
    doc.text(pickupLines[i], margin + 50, yPos);
    yPos += 5;
  }
  
  yPos += 2;
  doc.setFont('helvetica', 'bold');
  doc.text('Delivery Address:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  
  const deliveryLines = splitText(data.deliveryAddress, 10, contentWidth - 50);
  for (let i = 0; i < deliveryLines.length; i++) {
    doc.text(deliveryLines[i], margin + 50, yPos);
    yPos += 5;
  }
  
  // Cargo details
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Commodity:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.commodity, margin + 50, yPos);
  
  if (data.totalWeight) {
    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Total Load Weight (kg):', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.totalWeight, margin + 50, yPos);
  }
  
  yPos += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Number of Pallets / Units:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.palletsOrUnits, margin + 50, yPos);
  
  // Payment details
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.text(`Rate (${data.currency}):`, margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.currency === 'ZAR' ? 'R' : '$'} ${data.rateAmount} per ${data.rateUnit}`, margin + 50, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Agreed Amount (${data.currency}):`, margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.currency === 'ZAR' ? 'R' : '$'} ${data.totalAmount}`, margin + 50, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Terms:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.paymentTerms, margin + 50, yPos);
  
  // Special instructions
  if (data.specialInstructions) {
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Special Instructions / Notes:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 7;
    
    const instructionLines = splitText(data.specialInstructions, 10, contentWidth);
    for (let i = 0; i < instructionLines.length; i++) {
      doc.text(instructionLines[i], margin, yPos);
      yPos += 5;
    }
  }
  
  // Contact information
  if (data.pickupContact) {
    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Contact at Pickup:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.pickupContact, margin + 50, yPos);
  }
  
  if (data.deliveryContact) {
    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Contact at Delivery:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.deliveryContact, margin + 50, yPos);
  }
  
  // Add a declaration and acceptance section
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('DECLARATION & ACCEPTANCE', margin, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 7;
  
  const declarationText = `By accepting this Load Confirmation, the transporter agrees to all terms and conditions stipulated herein, including adherence to all safety, compliance, and operational requirements as communicated by ${companyDetails.name}.`;
  
  const declarationLines = splitText(declarationText, 10, contentWidth);
  for (let i = 0; i < declarationLines.length; i++) {
    doc.text(declarationLines[i], margin, yPos);
    yPos += 5;
  }
  
  // Signature sections
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Transporter/Carrier Representative:', margin, yPos);
  yPos += 10;
  doc.text('Signature: __________________________', margin, yPos);
  yPos += 7;
  doc.text('Name: _____________________________', margin, yPos);
  if (data.transporterName) {
    doc.setFont('helvetica', 'normal');
    doc.text(data.transporterName, margin + 35, yPos);
  }
  yPos += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Date: _____________________________', margin, yPos);
  
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.companyEntity === 'sa' ? 'Matanuska' : 'Matanuska Distribution'} Representative:`, margin, yPos);
  yPos += 10;
  doc.text('Signature: __________________________', margin, yPos);
  yPos += 7;
  doc.text('Name: _____________________________', margin, yPos);
  if (data.matanuskaRepName) {
    doc.setFont('helvetica', 'normal');
    doc.text(data.matanuskaRepName, margin + 35, yPos);
  }
  yPos += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Date: _____________________________', margin, yPos);
  
  // Add footer
  const footerYPos = doc.internal.pageSize.height - 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on ${format(new Date(), 'yyyy-MM-dd HH:mm')} | ${data.currency} Load Confirmation | ${data.loadRefNumber}`, pageWidth / 2, footerYPos, { align: 'center' });
  
  // Return the PDF as a blob
  return doc.output('blob');
};

// Define inspection types to avoid import issues from TSX files
interface InspectionItem {
  id: string;
  name: string;
  status: 'Pass' | 'Fail' | 'NA';
  comments?: string;
  images?: string[];
}

interface InspectionReport {
  id: string;
  reportNumber: string;
  vehicleId: string;
  inspectionDate: string;
  inspector: string;
  items: InspectionItem[];
  overallCondition: 'Pass' | 'Fail';
  notes?: string;
  attachments?: string[];
  signatureUrl?: string;
}

export const generateInspectionPDF = (report: InspectionReport): void => {
  const doc = new jsPDF();
  
  // Add a title
  doc.setFontSize(20);
  doc.text('Vehicle Inspection Report', 105, 15, { align: 'center' });
  
  // Add report metadata
  doc.setFontSize(12);
  doc.text(`Report #: ${report.reportNumber}`, 20, 30);
  doc.text(`Date: ${format(new Date(report.inspectionDate), 'dd/MM/yyyy')}`, 20, 37);
  doc.text(`Vehicle ID: ${report.vehicleId}`, 20, 44);
  doc.text(`Inspector: ${report.inspector}`, 20, 51);
  doc.text(`Overall Condition: ${report.overallCondition}`, 20, 58);
  
  // Add inspection items table
  const tableData = report.items.map((item: InspectionItem) => [
    item.name,
    item.status,
    item.comments || ''
  ]);
  
  doc.autoTable({
    startY: 65,
    head: [['Item', 'Status', 'Comments']],
    body: tableData,
    styles: { 
      fontSize: 10,
    },
    headStyles: {
      fillColor: [66, 66, 66],
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 30 },
      2: { cellWidth: 'auto' },
    }
  });
  
  // Add notes if any
  if (report.notes) {
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.text('Notes:', 20, finalY + 10);
    doc.setFontSize(10);
    doc.text(report.notes, 20, finalY + 17);
  }
  
  // Save the PDF
  doc.save(`Inspection_Report_${report.reportNumber}.pdf`);
};
