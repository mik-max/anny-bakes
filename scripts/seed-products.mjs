// Seeds the product catalogue from the client's rollout plan (Sep 2026).
//
//   npm run db:seed            → inserts products if the collection is empty
//   npm run db:seed -- --reset → deletes all products first, then inserts
//
// Names and prices are copied as given; several are awaiting client
// confirmation (see DECISIONS.md). Descriptions and photos are still to come.
import { MongoClient } from "mongodb";

// [name, category, price in cents, image?]
const MENU = [
  ["Chocolate Cherry Sourdough", "Sourdough", 1158],
  ["Toasted Spelt Sourdough", "Sourdough", 1098],
  ["Seeded Grain Sourdough", "Sourdough", 968],
  ["Honey Garlic Rosemary Focaccia", "Focaccia", 950], // "$9.50 * 2 per 1000g flat pan" — unclear
  ["Anny's Bischoff Cookie Butter Donut", "Donuts", 450],
  ["Chocolate Babka", "Babka", 660],
  ["Blueberry Jumbo Muffin", "Muffins", 475, "/images/bluberry_muffins.png"],
  ["Honey Chocolate Jumbo Muffin", "Muffins", 655],
  ["Morning Glory Jumbo Muffin", "Muffins", 717],
  ["Pecan Cranberry Sandwich Loaf", "Bread", 656],
  ["Trian Cheese Brioche", "Bread", 646],
  ["Wheaton Melton Brioche", "Bread", 1136],
  ["Happy Nutty Mix Brioche", "Bread", 736],
  ["Anny's Berry Bomb Bun", "Buns", 610],
  ["Vanilla Bean Brioche Bun", "Buns", 510],
  ["Lemon Coconut Burger Bun", "Buns", 610],
  ["Malted Coffee Butter Croissant", "Croissants", 700],
  ["Hazelnut Choc Dipped Croissant", "Croissants", 745],
  ["Spiced Bischoff Croissant", "Croissants", 495],
  ["Berry Mix Glaze Donut", "Donuts", 555],
  ["Rocky Road Brownie Donut", "Donuts", 625],
  ["Vanilla Cinnamon Cronut", "Donuts", 515],
  ["Lemon Blueberry Nut Mix Cake", "Cakes", 870],
  ["Red Velvet White Cocoa Frosting Cake", "Cakes", 970, "/images/red_velvet.png"],
  ["Double Chocolate Garnash Sprinkle Cake", "Cakes", 1170],
  ["Choc Chunk Cookie", "Cookies", 520],
  ["Dark Choc Covered Shortbread", "Cookies", 2240],
  ["Almond Shortbread", "Cookies", 2250],
];

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Add it to .env.local.");
  process.exit(1);
}

const client = new MongoClient(uri);
try {
  await client.connect();
  const products = client.db(process.env.MONGODB_DB).collection("products");

  if (process.argv.includes("--reset")) {
    const { deletedCount } = await products.deleteMany({});
    console.log(`Deleted ${deletedCount} existing products.`);
  }

  if ((await products.countDocuments()) > 0) {
    console.log("Products already exist — nothing to do. Use --reset to replace them.");
  } else {
    await insertMenu(products);
  }
} finally {
  await client.close();
}

async function insertMenu(products) {
  const now = new Date();
  const { insertedCount } = await products.insertMany(
    MENU.map(([name, category, price, image_url = ""]) => ({
      name,
      description: "",
      category,
      price,
      image_url,
      in_stock: true,
      featured: false,
      created_at: now,
    }))
  );
  console.log(`Inserted ${insertedCount} products.`);
}
