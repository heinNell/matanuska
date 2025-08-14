/**
 * Defect item type definition
 */
export interface DefectItem {
  type: 'repair' | 'replace';
  name: string;
}

/**
 * Parses inspection notes to extract repair and replacement items.
 * 
 * @param notes The inspection notes string
 * @returns Array of defect items (repairs and replacements)
 */
export function parseInspectionDefects(notes: string): DefectItem[] {
  const defectItems: DefectItem[] = [];
  
  // Look for common repair indicators
  if (notes.toLowerCase().includes('wheel alignment') || notes.toLowerCase().includes('alignment')) {
    defectItems.push({ type: 'repair', name: 'Alignment' });
  }
  
  if (notes.toLowerCase().includes('check') || notes.toLowerCase().includes('steering control')) {
    defectItems.push({ type: 'repair', name: 'Steering Control Check' });
  }
  
  if (notes.toLowerCase().includes('regasing') || notes.toLowerCase().includes('air conditioning')) {
    defectItems.push({ type: 'repair', name: 'Air Conditioning Regas' });
  }
  
  // Look for common replacement indicators
  if (notes.toLowerCase().includes('intercooler horse') || notes.toLowerCase().includes('hose')) {
    defectItems.push({ type: 'replace', name: 'Hoses and Connections' });
  }
  
  if (notes.toLowerCase().includes('fuel filter')) {
    defectItems.push({ type: 'replace', name: 'Fuel Filters' });
  }
  
  if (notes.toLowerCase().includes('oil filter')) {
    defectItems.push({ type: 'replace', name: 'Oil Filter' });
  }
  
  if (notes.toLowerCase().includes('water sep filter') || notes.toLowerCase().includes('water separator')) {
    defectItems.push({ type: 'replace', name: 'Water Separator Filter' });
  }
  
  if (notes.toLowerCase().includes('air filter')) {
    defectItems.push({ type: 'replace', name: 'Air Filter' });
  }

  if (notes.toLowerCase().includes('battery water')) {
    defectItems.push({ type: 'replace', name: 'Battery Water' });
  }

  if (notes.toLowerCase().includes('engine oil')) {
    defectItems.push({ type: 'replace', name: 'Engine Oil' });
  }

  if (notes.toLowerCase().includes('diff oil')) {
    defectItems.push({ type: 'replace', name: 'Differential Oil' });
  }

  if (notes.toLowerCase().includes('gear oil')) {
    defectItems.push({ type: 'replace', name: 'Gear Oil' });
  }
  
  return defectItems;
}
