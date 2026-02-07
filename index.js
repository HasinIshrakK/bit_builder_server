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

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@cluster0.rwnir9j.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db, membersCollection, projectsCollection;
async function run() {
  try {
    // await client.connect();

    db = client.db("bit_builder");
    membersCollection = db.collection("members");
    projectsCollection = db.collection("projects");
    // members api
    // app.get('/members', async (req, res)=> {
    //   const members = await membersCollection.find().toArray();
    //   res.send(members)
    // })

    // all get
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

    // single get
    app.get("/members/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await membersCollection.findOne(query);
      res.send(result);
    });


    // app.post("/members", async (req, res) => {
    //   const member = req.body;
    //   const result = await membersCollection.insertOne(member);
    //   res.send(result);
    // });


    // post
    app.post("/members", async (req, res) => {
      const member = req.body;
      const existing = await membersCollection.findOne({ email: member.email });
      if (existing) {
        return res.send({ message: "Member already exists" });
      }
      const result = await membersCollection.insertOne(member);
      res.send(result);
    });

    // patch
    app.patch("/members/:id", async (req, res) => {
      const id = req.params.id;
      const updateMember = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updateMember.name,
          role: updateMember.role,
          email: updateMember.email,
          discord: updateMember.discord,
          phone: updateMember.phone,
          facebook: updateMember.facebook,
          image: updateMember.image,
          bio: updateMember.bio,
          skills: updateMember.skills,
        },
      };
      const options = {};
      const result = await membersCollection.updateOne(query, update, options);
      res.send(result);
    });

    // delete
    app.delete("/members/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await membersCollection.deleteOne(query);
      res.send(result);
    });


    // ping
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!",
    // );
  } 
  finally {

  }
}

app.get("/projects", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const sortBy = req.query.sortBy || "name";
    const order = req.query.order === "desc" ? -1 : 1;

    const skip = (page - 1) * limit;
    const projects = await projectsCollection
        .find()
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .toArray();

    const total = await projectsCollection.countDocuments();

    res.send({
      data: projects,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).send({ message: "Server error" });
  }
});

app.get("/projects/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await projectsCollection.findOne(query);
  res.send(result);
});

app.post('/projects', async(req, res) => {
  const project = req.body;
  const result = await projectsCollection.insertOne(project);
  res.send(result);
});

app.patch('/projects/:id', async(req, res) => {
  const id = req.params.id;
  const updateData = req.body;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: updateData,
  };
  const result = await projectsCollection.updateOne(filter, updateDoc);
  res.send(result);
});

app.delete('/projects/:id', async(req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await projectsCollection.deleteOne(query);
  res.send(result);
})
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Bit Builder listening on port ${port}`);
})
