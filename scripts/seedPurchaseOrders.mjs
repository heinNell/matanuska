// seedPurchaseOrders.mjs - For use with Node.js to seed purchase order data into Firestore
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from 'fs';

// Check if service account key file exists and load it
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
  console.log('✅ Service account key loaded successfully');
} catch (error) {
  console.error('❌ Error loading service account key:', error.message);
  console.log('\n📝 INSTRUCTIONS:');
  console.log('1. Go to Firebase Console → Project Settings → Service Accounts');
  console.log('2. Click "Generate new private key"');
  console.log('3. Save the file as "serviceAccountKey.json" in the project root directory');
  console.log('4. Run this script again\n');
  process.exit(1);
}

// Initialize Firebase Admin
try {
  initializeApp({
    credential: cert(serviceAccount)
  });
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error);
  process.exit(1);
}

const db = getFirestore();

// Sample purchase order data
const purchaseOrders = [
  {
    poNumber: 'PO-231782',
    title: 'Emergency Brake Parts Order',
    description: 'Urgent order for brake components needed for fleet maintenance',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    vendor: 'AutoParts International',
    vendorId: 'VND001',
    requester: 'Workshop Manager',
    priority: 'High',
    status: 'Ordered',
    terms: 'Net 30',
    poType: 'Emergency',
    shippingAddress: 'Main Workshop, 123 Transport Drive, Johannesburg',
    items: [
      {
        id: 'item-1',
        itemCode: 'PTR-004',
        description: 'Front brake pad set for heavy duty trucks',
        quantity: 5,
        unit: 'Set',
        unitPrice: 1250.00,
        total: 6250.00
      },
      {
        id: 'item-2',
        itemCode: 'BRK-022',
        description: 'Brake caliper repair kit',
        quantity: 3,
        unit: 'Kit',
        unitPrice: 850.00,
        total: 2550.00
      }
    ],
    subTotal: 8800.00,
    tax: 1320.00,
    shipping: 500.00,
    grandTotal: 10620.00,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Workshop Manager',
    attachments: []
  },
  {
    poNumber: 'PO-231783',
    title: 'Regular Maintenance Supplies',
    description: 'Quarterly order for regular maintenance supplies',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    vendor: 'Truck Spare Parts Ltd',
    vendorId: 'VND002',
    requester: 'Fleet Manager',
    priority: 'Medium',
    status: 'Pending',
    terms: 'Net 45',
    poType: 'Standard',
    shippingAddress: 'Main Workshop, 123 Transport Drive, Johannesburg',
    items: [
      {
        id: 'item-1',
        itemCode: 'PTR-001',
        description: 'High quality fuel filter for diesel engines',
        quantity: 20,
        unit: 'Each',
        unitPrice: 450.00,
        total: 9000.00
      },
      {
        id: 'item-2',
        itemCode: 'PTR-002',
        description: 'Heavy duty air filter for trucks',
        quantity: 20,
        unit: 'Each',
        unitPrice: 350.00,
        total: 7000.00
      },
      {
        id: 'item-3',
        itemCode: 'PTR-003',
        description: 'Premium engine oil filter',
        quantity: 20,
        unit: 'Each',
        unitPrice: 275.00,
        total: 5500.00
      },
      {
        id: 'item-4',
        itemCode: 'PTR-005',
        description: '15W-40 diesel engine oil, 20L',
        quantity: 15,
        unit: 'Container',
        unitPrice: 850.00,
        total: 12750.00
      }
    ],
    subTotal: 34250.00,
    tax: 5137.50,
    shipping: 1500.00,
    grandTotal: 40887.50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Fleet Manager',
    attachments: []
  },
  {
    poNumber: 'PO-231784',
    title: 'Tire Replacement Order',
    description: 'New tires for long-haul trucks',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    vendor: 'Premier Tire Suppliers',
    vendorId: 'VND005',
    requester: 'Workshop Supervisor',
    priority: 'Medium',
    status: 'Approved',
    terms: 'Net 30',
    poType: 'Standard',
    shippingAddress: 'Main Workshop, 123 Transport Drive, Johannesburg',
    items: [
      {
        id: 'item-1',
        itemCode: 'PTR-011',
        description: 'Premium drive axle truck tire 315/80R22.5',
        quantity: 16,
        unit: 'Each',
        unitPrice: 5500.00,
        total: 88000.00
      },
      {
        id: 'item-2',
        itemCode: 'PTR-012',
        description: 'Premium steer axle truck tire 385/65R22.5',
        quantity: 8,
        unit: 'Each',
        unitPrice: 6200.00,
        total: 49600.00
      }
    ],
    subTotal: 137600.00,
    tax: 20640.00,
    shipping: 0.00,
    grandTotal: 158240.00,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Workshop Supervisor',
    attachments: []
  },
  {
    poNumber: 'PO-231785',
    title: 'Workshop Tools Order',
    description: 'New diagnostic and repair tools for the workshop',
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    vendor: 'Global Truck Services',
    vendorId: 'VND004',
    requester: 'Workshop Manager',
    priority: 'Low',
    status: 'Draft',
    terms: 'Net 60',
    poType: 'Standard',
    shippingAddress: 'Main Workshop, 123 Transport Drive, Johannesburg',
    items: [
      {
        id: 'item-1',
        itemCode: 'TOOL-001',
        description: 'Heavy Duty Diagnostic Scanner',
        quantity: 1,
        unit: 'Each',
        unitPrice: 45000.00,
        total: 45000.00
      },
      {
        id: 'item-2',
        itemCode: 'TOOL-002',
        description: 'Hydraulic Press 50-Ton',
        quantity: 1,
        unit: 'Each',
        unitPrice: 28000.00,
        total: 28000.00
      },
      {
        id: 'item-3',
        itemCode: 'TOOL-003',
        description: 'Pneumatic Impact Wrench Set',
        quantity: 3,
        unit: 'Set',
        unitPrice: 6500.00,
        total: 19500.00
      }
    ],
    subTotal: 92500.00,
    tax: 13875.00,
    shipping: 3500.00,
    grandTotal: 109875.00,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Workshop Manager',
    attachments: []
  },
  {
    poNumber: 'PO-231786',
    title: 'Electrical Components Order',
    description: 'Electrical parts for truck repairs and maintenance',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    vendor: 'AfriTech Auto Supplies',
    vendorId: 'VND003',
    requester: 'Electrical Technician',
    priority: 'Medium',
    status: 'Completed',
    terms: 'Net 30',
    poType: 'Standard',
    shippingAddress: 'Main Workshop, 123 Transport Drive, Johannesburg',
    items: [
      {
        id: 'item-1',
        itemCode: 'PTR-008',
        description: '24V truck alternator, 150A',
        quantity: 3,
        unit: 'Each',
        unitPrice: 3850.00,
        total: 11550.00
      },
      {
        id: 'item-2',
        itemCode: 'PTR-009',
        description: '12V truck battery, high capacity',
        quantity: 5,
        unit: 'Each',
        unitPrice: 2200.00,
        total: 11000.00
      },
      {
        id: 'item-3',
        itemCode: 'ELEC-001',
        description: 'Wiring harness for heavy duty truck',
        quantity: 2,
        unit: 'Each',
        unitPrice: 4200.00,
        total: 8400.00
      },
      {
        id: 'item-4',
        itemCode: 'ELEC-002',
        description: 'LED Headlight Set',
        quantity: 4,
        unit: 'Set',
        unitPrice: 1800.00,
        total: 7200.00
      }
    ],
    subTotal: 38150.00,
    tax: 5722.50,
    shipping: 1000.00,
    grandTotal: 44872.50,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'Electrical Technician',
    approvedBy: 'Workshop Manager',
    approvedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    attachments: []
  }
];

// Function to seed purchase orders to Firestore
async function seedPurchaseOrders() {
  try {
    // Get a reference to the purchaseOrders collection
    const purchaseOrdersCollection = db.collection('purchaseOrders');
    
    // Create a batch
    const batch = db.batch();
    
    // Check if purchase orders already exist
    const existingPOs = await purchaseOrdersCollection.get();
    if (!existingPOs.empty) {
      console.log(`⚠️ ${existingPOs.size} purchase orders already exist in the database.`);
      const shouldContinue = process.argv.includes('--force');
      if (!shouldContinue) {
        console.log('\n❓ To overwrite existing data, run with --force flag.');
        process.exit(0);
      } else {
        console.log('⚠️ --force flag detected. Proceeding to overwrite existing data...');
        // Delete existing purchase orders if --force is provided
        const deletePromises = existingPOs.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);
        console.log('✅ Existing purchase orders deleted successfully.');
      }
    }
    
    // Add all purchase orders to batch
    for (const po of purchaseOrders) {
      const docRef = purchaseOrdersCollection.doc(); // Auto-generate IDs
      batch.set(docRef, po);
    }
    
    // Commit the batch
    await batch.commit();
    
    console.log(`✅ Successfully seeded ${purchaseOrders.length} purchase orders to Firestore.`);
  } catch (error) {
    console.error('❌ Error seeding purchase orders:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedPurchaseOrders()
  .then(() => {
    console.log('✅ Purchase order seeding complete.');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error during seeding process:', error);
    process.exit(1);
  });
