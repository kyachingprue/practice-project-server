require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT_URL || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

//Middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://practice-project-client-fzgg.vercel.app',
      'https://practice-project-client-git-9df047-kyachingprue-marmas-projects.vercel.app',
      'https://practice-project-client-fzgg-myrz8m7p0.vercel.app',
    ],
    credentials: true,
  }),
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nhw49.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db('admin').command({ ping: 1 });
    // console.log(
    //   'Pinged your deployment. You successfully connected to MongoDB!',
    // );

    const usersCollection = client.db('practice-project').collection('users');
    const productsCollection = client
      .db('practice-project')
      .collection('products');

    app.get('/users/email/:email', async (req, res) => {
      const email = req.params.email;

      if (!email) {
        return res.status(400).send({ message: 'Email is required' });
      }

      const query = { email: email };

      const result = await usersCollection.find(query).toArray();

      res.send(result);
    });

    app.post('/users', async (req, res) => {
      try {
        const { name, email, image, cover_image, role } = req.body;

        if (!email || !name || !role) {
          return res
            .status(400)
            .send({ message: 'Name, email, and role are required' });
        }

        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
          return res.status(409).send({ message: 'User already exists' });
        }

        const result = await usersCollection.insertOne({
          name,
          email,
          image: image || null,
          cover_image: cover_image || null,
          role,
          createdAt: new Date(),
        });

        res.status(201).send({
          message: 'User added successfully',
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error' });
      }
    });

    //PRODUCTS API
    app.get('/products', async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    });
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id; // string
      const product = await productsCollection.findOne({ _id: id });
      if (!product)
        return res.status(404).send({ message: 'Product not found' });
      res.send(product);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Server is running...');
});

app.listen(port, () => {
  console.log(`Server side running on PORT: ${port}`);
});
