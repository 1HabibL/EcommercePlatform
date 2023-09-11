const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb'); // Import ObjectId
const app = express();
const port = 3000; // You can use any other port if 3000 is already in use

// Set 'views' as the directory for EJS templates (if not already set)
app.set('views', './views');

// Use the EJS template engine
app.set('view engine', 'ejs');

// Require the imageResize.js file
const { resizeAllImages } = require('./resizeImages');

// Serve static files from the 'public' folder
app.use(express.static('public'));
app.use(express.static('resized_images'));
app.use(express.urlencoded({ extended: true }));


// Example usage of resizing all images in the 'uploads' directory
resizeAllImages('uploads', 'resized_images', 183, 275);

// MongoDB connection URI and options
const uri =
  "mongodb+srv://commerce1:mongo@ecommerceproject.r3aj6ux.mongodb.net/?retryWrites=true&w=majority";
const mongoClientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Fetch data from MongoDB and pass it to the EJS template
async function fetchDataFromMongoDB() {
  try {
    await client.connect();

    const db = client.db("store");
    const collection = db.collection("storeproducts");

    // Fetch the data from MongoDB and convert it to an array
    const data = await collection.find({}).toArray();

    return data;
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    return []; // Return an empty array if there's an error to avoid breaking the template rendering
  } finally {
    await client.close();
  }
}

// Route to render the HTML file with MongoDB data
app.get('/', async (req, res) => {
  // Fetch data from MongoDB
  const data = await fetchDataFromMongoDB();

  // Render the HTML file using EJS and pass the data to it
  res.render('index', { data });
});

// Route for product details page
app.get('/product/:productId', async (req, res) => {
  const productId = req.params.productId;

  try {
    await client.connect();
    const db = client.db('store');
    const collection = db.collection('storeproducts');
    const product = await collection.findOne({ _id: new ObjectId(productId) }); // Use new ObjectId()

    if (!product) {
      return res.status(404).send('Product not found');
    }

    res.render('product-details', { product });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).send('Error fetching product details');
  } finally {
    await client.close();
  }
});


app.get('/images/:imageId', async (req, res) => {
  const imageId = req.params.imageId;

  try {
    await client.connect();
    const db = client.db('store'); // Replace with your actual database name
    const bucket = new GridFSBucket(db);

    const downloadStream = bucket.openDownloadStream(imageId);
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error retrieving image:', error);
    res.status(500).send('Error retrieving image');
  } finally {
    await client.close();
  }
});

// Shopping cart data structure
const shoppingCart = [];

// Route to handle adding products to the cart
app.post('/add-to-cart', async (req, res) => {
  const productId = req.body.productId;

  try {
    await client.connect();
    const db = client.db('store');
    const collection = db.collection('storeproducts');
    const product = await collection.findOne({ _id: new ObjectId(productId) }); // Use new ObjectId()

    if (product) {
      // Add the product to the shopping cart
      shoppingCart.push(product);
      res.redirect('/'); // Redirect back to the index page
    } else {
      res.status(404).send('Product not found');
    }
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).send('Error adding product to cart');
  } finally {
    await client.close();
  }
});


// Route to handle adding products to the cart (remove from cart feature)
app.post('/remove-from-cart', (req, res) => {
  const productId = req.body.productId;
  const index = shoppingCart.findIndex(item => item._id.toString() === productId);

  if (index !== -1) {
    shoppingCart.splice(index, 1);
  }

  res.redirect('/shoppingcart'); // Redirect back to the shopping cart page
});

app.get('/shoppingcart', (req, res) => {
  // Render the shoppingcart.ejs template and pass the shoppingCart data
  res.render('shoppingcart', { shoppingCart });
});

// Start the web server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
