const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");

    // Clear existing listings
    await Listing.deleteMany({});

    const ownerId = mongoose.Types.ObjectId("69301b75d0d3e628fbded7f3");

    // Add owner to each listing
    const listingsWithOwner = initData.data.map((obj) => ({
      ...obj,
      owner: ownerId,
    }));

    await Listing.insertMany(listingsWithOwner);
    console.log("Data was initialized");
  } catch (err) {
    console.error("Error connecting to MongoDB or initializing data:", err);
  } finally {
    mongoose.connection.close(); // close connection after seeding
  }
}
 
main();
