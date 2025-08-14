import React, { useRef } from 'react';
import { jsPDF } from 'jspdf';

interface TyreInspectionData {
  fleetNumber: string;
  position: string;
  tyreBrand?: string;
  tyreSize?: string;
  treadDepth?: number | string;
  pressure?: number | string;
  condition?: string;
  notes?: string;
  inspectorName?: string;
  odometer?: number | string;
  photo?: string | null;
  signature?: string | null;
  inspectionDate?: string;
  lastUpdated?: string;
}

interface TyreInspectionPDFGeneratorProps {
  inspectionData: TyreInspectionData;
  companyName?: string;
  companyAddress?: string;
}

export const TyreInspectionPDFGenerator: React.FC<TyreInspectionPDFGeneratorProps> = ({ 
  inspectionData,
  companyName = 'Matanuska Transport',
  companyAddress = '123 Main Street, City, Country'
}) => {
  const pdfRef = useRef<HTMLDivElement>(null);
  
  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add header
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 128);
    doc.text('Tyre Inspection Report', 105, 15, { align: 'center' });
    
    // Add company info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(companyName, 105, 25, { align: 'center' });
    doc.setFontSize(10);
    doc.text(companyAddress, 105, 30, { align: 'center' });
    
    // Add line
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    // Add vehicle information
    doc.setFontSize(14);
    doc.text('Vehicle & Tyre Information', 20, 45);
    
    doc.setFontSize(10);
    doc.text('Fleet Number:', 20, 55);
    doc.text(inspectionData.fleetNumber || 'N/A', 70, 55);
    
    doc.text('Tyre Position:', 20, 60);
    doc.text(inspectionData.position || 'N/A', 70, 60);
    
    doc.text('Inspection Date:', 20, 65);
    doc.text(inspectionData.inspectionDate ? new Date(inspectionData.inspectionDate).toLocaleDateString() : 'N/A', 70, 65);
    
    doc.text('Odometer:', 20, 70);
    doc.text(inspectionData.odometer?.toString() || 'N/A', 70, 70);
    
    // Add tyre details
    doc.setFontSize(14);
    doc.text('Tyre Details', 20, 85);
    
    doc.setFontSize(10);
    doc.text('Brand:', 20, 95);
    doc.text(inspectionData.tyreBrand || 'N/A', 70, 95);
    
    doc.text('Size:', 20, 100);
    doc.text(inspectionData.tyreSize || 'N/A', 70, 100);
    
    doc.text('Tread Depth:', 20, 105);
    doc.text(`${inspectionData.treadDepth || 'N/A'} mm`, 70, 105);
    
    doc.text('Pressure:', 20, 110);
    doc.text(`${inspectionData.pressure || 'N/A'} PSI`, 70, 110);
    
    doc.text('Condition:', 20, 115);
    doc.text(inspectionData.condition || 'N/A', 70, 115);
    
    // Add notes
    doc.setFontSize(14);
    doc.text('Notes', 20, 130);
    
    doc.setFontSize(10);
    const splitNotes = doc.splitTextToSize(inspectionData.notes || 'No notes provided.', 150);
    doc.text(splitNotes, 20, 140);
    
    // Add inspector info
    doc.setFontSize(14);
    doc.text('Inspection Details', 20, 180);
    
    doc.setFontSize(10);
    doc.text('Inspector Name:', 20, 190);
    doc.text(inspectionData.inspectorName || 'N/A', 70, 190);
    
    // Add signature if available
    if (inspectionData.signature) {
      doc.text('Signature:', 20, 200);
      try {
        doc.addImage(inspectionData.signature, 'PNG', 70, 195, 40, 15);
      } catch {
        doc.text('Signature not available', 70, 200);
      }
    }
    
    // Add photo if available
    if (inspectionData.photo) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Tyre Photo', 105, 20, { align: 'center' });
      try {
        doc.addImage(inspectionData.photo, 'PNG', 55, 30, 100, 100);
      } catch {
        doc.text('Photo not available', 105, 80, { align: 'center' });
      }
    }
    
    // Add footer with page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
      doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 292, { align: 'center' });
    }
    
    // Save the PDF
    doc.save(`Tyre_Inspection_${inspectionData.fleetNumber}_${inspectionData.position}.pdf`);
  };
  
  return (
    <div ref={pdfRef}>
      <button 
        onClick={generatePDF}
        className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Generate PDF Report
      </button>
    </div>
  );
};

export default TyreInspectionPDFGenerator;
