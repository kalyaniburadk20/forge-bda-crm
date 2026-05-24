import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./db.js";
import User from "../models/User.js";
import Lead from "../models/Lead.js";

dotenv.config();

const seed = async () => {
  await connectDB();
  await Lead.deleteMany();
  await User.deleteMany();

  const admin = await User.create({
    name: "Admin User",
    email: "admin@crm.com",
    password: "password123",
    role: "admin",
  });

  const manager = await User.create({
    name: "Maya Manager",
    email: "manager@crm.com",
    password: "password123",
    role: "manager",
  });

  const assoc1 = await User.create({
    name: "Arjun Associate",
    email: "arjun@crm.com",
    password: "password123",
    role: "associate",
    manager: manager._id,
  });

  const assoc2 = await User.create({
    name: "Priya Associate",
    email: "priya@crm.com",
    password: "password123",
    role: "associate",
    manager: manager._id,
  });

  const stages = ["new", "contacted", "qualified", "proposal", "won", "lost"];
  const companies = [
    "Acme Manufacturing", "BoltWorks Pvt Ltd", "Crescent Steel", "Delta Components",
    "Everest Tools", "Falcon Machines", "Gravita Industries", "Helix Fabrication",
    "Indus Castings", "Jupiter Engineering",
  ];

  const leads = [];
  companies.forEach((company, i) => {
    leads.push({
      company,
      contactName: `Contact ${i + 1}`,
      email: `contact${i + 1}@example.com`,
      phone: `+91 90000 0000${i}`,
      stage: stages[i % stages.length],
      value: (i + 1) * 50000,
      source: ["referral", "website", "cold-call", "event", "other"][i % 5],
      priority: ["low", "medium", "high"][i % 3],
      owner: i % 2 === 0 ? assoc1._id : assoc2._id,
      expectedCloseDate: new Date(Date.now() + (i + 5) * 86400000),
      activities: [{ type: "note", message: "Initial lead created", createdBy: manager._id }],
    });
  });

  await Lead.insertMany(leads);

  console.log("Seed complete.");
  console.log("Logins (password = password123): admin@crm.com | manager@crm.com | arjun@crm.com | priya@crm.com");
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
