require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// middleWare
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Bit Builder is running!");
});

app.listen(port, () => {
  console.log(`Bit Builder listening on port ${port}`);
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@cluster0.w0nmtjl.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();

    const db = client.db("bit_builder");
    const membersCollection = db.collection("members");

    // members api
    // app.get('/members', async (req, res)=> {
    //   const members = await membersCollection.find().toArray();
    //   res.send(members)
    // })

    app.get("/members", async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const sortBy = req.query.sortBy || "name";
        const order = req.query.order === "desc" ? -1 : 1;

        const skip = (page - 1) * limit;

        const members = await membersCollection
          .find()
          .sort({ [sortBy]: order })
          .skip(skip)
          .limit(limit)
          .toArray();

        const total = await membersCollection.countDocuments();

        res.send({
          data: members,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        });
      } catch (error) {
        res.status(500).send({ message: "Server error" });
      }
    });

    app.get("/members/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await membersCollection.findOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
  }
}
run().catch(console.dir);
