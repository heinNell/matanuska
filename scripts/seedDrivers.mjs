import { initializeApp } from "firebase/app";
import { collection, getFirestore, writeBatch } from "firebase/firestore";
import { firebaseConfig } from "./src/firebaseConfig.js"; // Adjust path if necessary

// IMPORTANT: Make sure your firebaseConfig.js is correctly pointing to your project.
// You might need to create this file from firebaseConfig.ts if it doesn't exist in JS format.

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const drivers = [
  {
    id: "DR-1001",
    firstName: "John",
    lastName: "Smith",
    status: "Active",
    licenseExpiry: "2024-05-15T00:00:00.000Z",
    phone: "(555) 123-4567",
    safetyScore: 95,
    location: "Phoenix, AZ",
  },
  {
    id: "DR-1002",
    firstName: "Michael",
    lastName: "Johnson",
    status: "Active",
    licenseExpiry: "2023-11-20T00:00:00.000Z",
    phone: "(555) 234-5678",
    safetyScore: 98,
    location: "Dallas, TX",
  },
  {
    id: "DR-1003",
    firstName: "Robert",
    lastName: "Williams",
    status: "On Leave",
    licenseExpiry: "2024-02-10T00:00:00.000Z",
    phone: "(555) 345-6789",
    safetyScore: 88,
    location: "Denver, CO",
  },
  {
    id: "DR-1004",
    firstName: "David",
    lastName: "Brown",
    status: "Active",
    licenseExpiry: "2024-07-22T00:00:00.000Z",
    phone: "(555) 456-7890",
    safetyScore: 94,
    location: "Seattle, WA",
  },
  {
    id: "DR-1005",
    firstName: "Sarah",
    lastName: "Davis",
    status: "Active",
    licenseExpiry: "2023-12-05T00:00:00.000Z",
    phone: "(555) 567-8901",
    safetyScore: 97,
    location: "Atlanta, GA",
  },
];

async function seedDrivers() {
  const driversCollection = collection(db, "drivers");
  const batch = writeBatch(db);

  drivers.forEach((driver) => {
    const docRef = collection(db, "drivers", driver.id);
    batch.set(docRef, driver);
  });

  try {
    await batch.commit();
    console.log(`Successfully seeded ${drivers.length} drivers.`);
  } catch (error) {
    console.error("Error seeding drivers:", error);
  }
}

seedDrivers().then(() => {
  console.log("Seeding complete. Exiting.");
  process.exit(0);
});
