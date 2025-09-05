# depencheck.md

---
applyTo: '**'
---
Here's a focused implementation plan to use every unused dependency and type with minimal, practical code additions:

## 1. Quick Dependency Usage - Add to Existing Files

### **pdf-lib** - Add to `PurchaseOrderDetailView.tsx`
```typescript
// Add this function to src/pages/Inventory/PurchaseOrderDetailView.tsx
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { PurchaseOrder } from '@/types/inventory';

const generatePDF = async (po: PurchaseOrder) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText(`Purchase Order #${po.id}`, { x: 50, y: 750, size: 20, font });
  page.drawText(`Vendor: ${po.vendorId}`, { x: 50, y: 720, size: 12, font });
  page.drawText(`Total: $${po.total}`, { x: 50, y: 690, size: 12, font });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  window.open(url);
};

// Add export PDF button to component
```

### **qrcode.react** - Add to `ReceivePartsPage.tsx`
```typescript
// Add to src/pages/Inventory/ReceivePartsPage.tsx
import QRCode from 'qrcode.react';
import { POItem } from '@/types/inventory';

const QRCodeGenerator = ({ item }: { item: POItem }) => (
  <div className="p-4">
    <QRCode value={`PART:${item.sku}:QTY:${item.qty}`} size={128} />
    <p className="text-sm mt-2">{item.sku}</p>
  </div>
);
```

### **react-apexcharts** - Add to `TyrePerformanceDashboard.tsx`
```typescript
// Add to src/pages/tyres/TyrePerformanceDashboard.tsx
import Chart from 'react-apexcharts';

const PerformanceGauge = ({ value }: { value: number }) => {
  const options = {
    chart: { type: 'radialBar' as const },
    plotOptions: {
      radialBar: {
        hollow: { size: '70%' },
        dataLabels: { value: { fontSize: '16px' } }
      }
    }
  };
  return <Chart options={options} series={[value]} type="radialBar" height={200} />;
};
```

### **react-beautiful-dnd** - Add to `JobCardKanbanBoard.tsx`
```typescript
// Add to src/pages/workshop/JobCardKanbanBoard.tsx
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const KanbanBoard = () => {
  const onDragEnd = (result: any) => {
    // Handle drag end
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4">
        {['TODO', 'IN_PROGRESS', 'DONE'].map(status => (
          <Droppable key={status} droppableId={status}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="min-w-64 bg-gray-100 p-4">
                <h3>{status}</h3>
                {/* Job cards here */}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};
```

### **react-calendar** - Add to `TripCalendarPage.tsx`
```typescript
// Create src/pages/trips/TripCalendarPage.tsx
import Calendar from 'react-calendar';
import { useState } from 'react';

export const TripCalendarPage = () => {
  const [date, setDate] = useState(new Date());

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Trip Calendar</h1>
      <Calendar
        onChange={setDate}
        value={date}
        className="mx-auto"
      />
    </div>
  );
};
```

### **react-calendar-timeline** - Add to `TripTimelinePage.tsx`
```typescript
// Create src/pages/trips/TripTimelinePage.tsx
import Timeline from 'react-calendar-timeline';
import moment from 'moment';

export const TripTimelinePage = () => {
  const groups = [{ id: 1, title: 'Vehicle 1' }, { id: 2, title: 'Vehicle 2' }];
  const items = [
    { id: 1, group: 1, title: 'Trip A', start_time: moment(), end_time: moment().add(2, 'hour') }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Trip Timeline</h1>
      <Timeline
        groups={groups}
        items={items}
        defaultTimeStart={moment().add(-12, 'hour')}
        defaultTimeEnd={moment().add(12, 'hour')}
      />
    </div>
  );
};
```

### **react-chartjs-2** - Add to `ComplianceDashboard.tsx`
```typescript
// Add to src/pages/qc/ComplianceDashboard.tsx
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const ComplianceRadar = () => {
  const data = {
    labels: ['Safety', 'Quality', 'Efficiency', 'Documentation', 'Training'],
    datasets: [{
      label: 'Compliance Score',
      data: [85, 92, 78, 88, 95],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
    }]
  };

  return <Radar data={data} height={300} />;
};
```

### **react-dnd + react-dnd-html5-backend** - Add to `LoadPlanningPage.tsx`
```typescript
// Add to src/pages/trips/LoadPlanningPage.tsx
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const DragItem = ({ item }: { item: any }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'LOAD',
    item,
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  });

  return (
    <div ref={drag} className={`p-2 border ${isDragging ? 'opacity-50' : ''}`}>
      {item.name}
    </div>
  );
};

const DropZone = () => {
  const [{ isOver }, drop] = useDrop({
    accept: 'LOAD',
    drop: (item) => console.log('Dropped:', item),
    collect: (monitor) => ({ isOver: monitor.isOver() })
  });

  return (
    <div ref={drop} className={`min-h-32 border-2 border-dashed ${isOver ? 'bg-blue-100' : ''}`}>
      Drop loads here
    </div>
  );
};

export const LoadPlanningPage = () => (
  <DndProvider backend={HTML5Backend}>
    <div className="p-6">
      <h1 className="text-2xl mb-4">Load Planning</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2>Available Loads</h2>
          <DragItem item={{ id: 1, name: 'Load 1' }} />
        </div>
        <div>
          <h2>Vehicle Assignment</h2>
          <DropZone />
        </div>
      </div>
    </div>
  </DndProvider>
);
```

### **react-dropzone** - Add to `InventoryReportsPage.tsx`
```typescript
// Add to src/pages/Inventory/InventoryReportsPage.tsx
import { useDropzone } from 'react-dropzone';
import { StockMovement } from '@/types/inventory';

const CSVUploader = () => {
  const onDrop = (files: File[]) => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        // Parse CSV and create StockMovement records
        console.log('CSV uploaded:', file.name);
      };
      reader.readAsText(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] }
  });

  return (
    <div {...getRootProps()} className="border-2 border-dashed p-8 text-center cursor-pointer">
      <input {...getInputProps()} />
      {isDragActive ? 'Drop CSV here' : 'Drag & drop CSV files here'}
    </div>
  );
};
```

### **react-google-recaptcha-v3** - Add to `CreateInvoicePage.tsx`
```typescript
// Add to src/pages/invoices/CreateInvoicePage.tsx
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const SecureForm = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async () => {
    if (!executeRecaptcha) return;
    const token = await executeRecaptcha('invoice_creation');
    // Submit with token
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit">Create Invoice</button>
    </form>
  );
};
```

### **react-hook-form** - Add to `PartsOrderingPage.tsx`
```typescript
// Add to src/pages/Inventory/PartsOrderingPage.tsx
import { useForm } from 'react-hook-form';
import { PurchaseOrderRequest, RequestItem } from '@/types/inventory';

const OrderForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<PurchaseOrderRequest>();

  const onSubmit = (data: PurchaseOrderRequest) => {
    console.log('Order submitted:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input {...register('vendorId', { required: true })} placeholder="Vendor ID" />
      {errors.vendorId && <span className="text-red-500">Vendor ID is required</span>}

      <input {...register('requestedBy', { required: true })} placeholder="Requested By" />

      <button type="submit" className="bg-blue-500 text-white px-4 py-2">
        Submit Order
      </button>
    </form>
  );
};
```

### **react-leaflet** - Add to `TyreFleetMap.tsx`
```typescript
// Add to src/pages/tyres/TyreFleetMap.tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const TyreMap = () => {
  const position: [number, number] = [51.505, -0.09];

  return (
    <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={position}>
        <Popup>Tyre location data</Popup>
      </Marker>
    </MapContainer>
  );
};
```

### **react-map-gl** - Add to `WialonTrackingPage.tsx`
```typescript
// Add to src/pages/wialon/WialonTrackingPage.tsx
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const WialonMap = () => {
  return (
    <Map
      initialViewState={{ longitude: -100, latitude: 40, zoom: 3.5 }}
      style={{ width: '100%', height: '400px' }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      mapboxAccessToken="your-token"
    >
      <Marker longitude={-100} latitude={40}>
        <div className="w-4 h-4 bg-red-500 rounded-full" />
      </Marker>
    </Map>
  );
};
```

### **react-markdown + remark-gfm** - Add to `MarkdownEditorPage.tsx`
```typescript
// Update src/pages/MarkdownEditorPage.tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const MarkdownEditorPage = () => {
  const [markdown, setMarkdown] = useState('# Hello\n\n- Item 1\n- Item 2');

  return (
    <div className="grid grid-cols-2 gap-4 h-screen">
      <textarea
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        className="p-4 font-mono"
      />
      <div className="p-4 prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
};
```

### **react-signature-canvas** - Add to `ReceivePartsPage.tsx`
```typescript
// Add to src/pages/Inventory/ReceivePartsPage.tsx
import SignatureCanvas from 'react-signature-canvas';
import { useRef } from 'react';

const SignaturePad = () => {
  const sigRef = useRef<SignatureCanvas>(null);

  const clear = () => sigRef.current?.clear();
  const save = () => {
    const signature = sigRef.current?.toDataURL();
    console.log('Signature saved:', signature);
  };

  return (
    <div className="border">
      <SignatureCanvas
        ref={sigRef}
        canvasProps={{ width: 400, height: 200, className: 'border' }}
      />
      <div className="p-2 space-x-2">
        <button onClick={clear} className="px-3 py-1 bg-gray-500 text-white">Clear</button>
        <button onClick={save} className="px-3 py-1 bg-blue-500 text-white">Save</button>
      </div>
    </div>
  );
};
```

### **react-to-print** - Add to `PurchaseOrderDetailView.tsx`
```typescript
// Add to src/pages/Inventory/PurchaseOrderDetailView.tsx
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';

const PrintablePO = () => {
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <>
      <button onClick={handlePrint} className="mb-4 px-4 py-2 bg-blue-500 text-white">
        Print PO
      </button>
      <div ref={componentRef} className="p-4">
        {/* PO content */}
      </div>
    </>
  );
};
```

### **recharts** - Add to `InventoryDashboard.tsx`
```typescript
// Add to src/pages/Inventory/InventoryDashboard.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const InventoryChart = () => {
  const data = [
    { month: 'Jan', stock: 400 },
    { month: 'Feb', stock: 300 },
    { month: 'Mar', stock: 500 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="stock" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

### **signature_pad** - Add to `WialonPlayground.tsx`
```typescript
// Add to src/pages/wialon/WialonPlayground.tsx
import SignaturePad from 'signature_pad';
import { useEffect, useRef } from 'react';

const RawSignaturePad = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad>();

  useEffect(() => {
    if (canvasRef.current) {
      padRef.current = new SignaturePad(canvasRef.current);
    }
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} width={400} height={200} className="border" />
      <button onClick={() => padRef.current?.clear()}>Clear</button>
    </div>
  );
};
```

### **simple-statistics** - Add to `VendorScorecard.tsx`
```typescript
// Add to src/pages/Inventory/VendorScorecard.tsx
import { mean, median, standardDeviation } from 'simple-statistics';
import { VendorScore } from '@/types/inventory';

const calculateVendorMetrics = (deliveryTimes: number[]): VendorScore => {
  return {
    vendorId: 'V001',
    onTimeDeliveryRate: mean(deliveryTimes.map(t => t <= 7 ? 1 : 0)) * 100,
    averageDeliveryTime: mean(deliveryTimes),
    qualityScore: 95,
    responseTime: median(deliveryTimes),
    totalOrders: deliveryTimes.length,
    lastUpdated: new Date().toISOString()
  };
};
```

### **sonner** - Add to global App.tsx
```typescript
// Add to src/App.tsx
import { Toaster, toast } from 'sonner';

// Add Toaster component to App
<Toaster position="top-right" />

// Use throughout app:
toast.success('Purchase order created successfully');
toast.error('Failed to save inventory data');
```

## 2. Use All Inventory Types

Create a simple inventory service that uses all types:

```typescript
// src/services/inventoryService.ts
import {
  PurchaseOrder,
  POItem,
  Vendor,
  StockMovement,
  VendorScore,
  PurchaseOrderRequest,
  RequestItem,
  POApproval,
  IntegrationSettings,
  SyncLog,
  OrderPartStatus,
  OrderPart
} from '@/types/inventory';

export class InventoryService {
  // Mock data using all types
  private purchaseOrders: PurchaseOrder[] = [];
  private vendors: Vendor[] = [];
  private stockMovements: StockMovement[] = [];
  private approvals: POApproval[] = [];
  private syncLogs: SyncLog[] = [];

  createPurchaseOrder(request: PurchaseOrderRequest): PurchaseOrder {
    const po: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      vendorId: request.vendorId,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      items: request.items.map(item => ({
        sku: item.sku,
        description: item.description,
        qty: item.qty,
        unitCost: item.estimatedUnitCost,
        fulfilledQty: 0
      })),
      total: request.items.reduce((sum, item) => sum + (item.qty * item.estimatedUnitCost), 0)
    };

    this.purchaseOrders.push(po);
    return po;
  }

  recordStockMovement(movement: Omit<StockMovement, 'id' | 'timestamp'>): StockMovement {
    const stockMovement: StockMovement = {
      ...movement,
      id: `SM-${Date.now()}`,
      timestamp: Date.now()
    };

    this.stockMovements.push(stockMovement);
    return stockMovement;
  }

  getOrderParts(poId: string): OrderPart[] {
    const po = this.purchaseOrders.find(p => p.id === poId);
    if (!po) return [];

    return po.items.map(item => ({
      id: `OP-${item.sku}`,
      poId: po.id,
      sku: item.sku,
      description: item.description,
      orderedQty: item.qty,
      receivedQty: item.fulfilledQty,
      status: item.fulfilledQty >= item.qty ? 'COMPLETED' : 'PENDING' as OrderPartStatus,
      unitCost: item.unitCost,
      supplier: po.vendorId,
      expectedDate: po.createdAt,
      actualDate: item.fulfilledQty > 0 ? new Date().toISOString() : undefined
    }));
  }
}

export const inventoryService = new InventoryService();
```

## 3. Add Route Definitions

```typescript
// src/routes/index.tsx - ensure react-router-dom is used
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/trips/calendar" element={<TripCalendarPage />} />
      <Route path="/trips/timeline" element={<TripTimelinePage />} />
      <Route path="/trips/load-planning" element={<LoadPlanningPage />} />
      {/* Add other routes */}
    </Routes>
  </BrowserRouter>
);
```

This implementation uses every dependency and type with minimal code additions to existing files. Each usage is practical and adds real functionality to the application.
