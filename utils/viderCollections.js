import { MongoClient } from "mongodb";

async function viderCollections() {
  const url = "mongodb://localhost:27017";
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log("Connecté à MongoDB");

    const db = client.db("Labo");

    // Récupérer toutes les collections
    const collections = await db.collections();

    for (const collection of collections) {
      console.log(`Vidage de la collection ${collection.collectionName}`);
      await collection.deleteMany({});
    }

    console.log("Toutes les collections ont été vidées.");
  } catch (err) {
    console.error("Erreur:", err);
  } finally {
    await client.close();
  }
}

viderCollections();
