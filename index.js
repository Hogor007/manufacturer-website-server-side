const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(bodyParser.json());

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.q4ici.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const run = async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db("toolsDB");
    const toolsCollection = db.collection("toolsCollection");
    const ordersCollection = db.collection("ordersCollection");
    const usersCollection = db.collection("usersCollection");
    const reviewsCollection = db.collection("reviewsCollection");
    const blogsCollection = db.collection("blogsCollection");
    const adminsCollection = db.collection("adminsCollection");


    //API to delete a order
    app.delete("/orders/:id", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.headers.email;
      if (email === decodedEmail) {
        const id = req.params.id;
        console.log("id", id);
        const result = await ordersCollection.deleteOne({
          _id: ObjectId(id),
        });
        res.send(result);
      } else {
        res.send("Unauthorized access");
      }
    });
  } finally {
    // client.close();
  }
};

run().catch(console.dir);

app.listen(port, () => console.log(`Listening on port ${port}`));