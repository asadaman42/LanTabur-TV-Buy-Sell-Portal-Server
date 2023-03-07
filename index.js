// required
const express = require('express');
const cors = require('cors');
const corsOptions = {
    origin: '*',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
// const jwt = require('jsonwebtoken');
const app = express();
app.use(cors(corsOptions));
const port = process.env.PORT || 5000;
app.use(express.json());

const uri = `mongodb+srv://${process.env.LANTABUR_USER}:${process.env.LANTABUR_PASSWORD}@lantaburtvbuyandsellpor.1h9iyo0.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



const run = async () => {
    try {
        const categoriesCollection = client.db('LanTaburTv').collection('categories');
        const bookingCollection = client.db('LanTaburTv').collection('bookings');
        const usersCollection = client.db('LanTaburTv').collection('users');
        const advertiseCollection = client.db('LanTaburTv').collection('advertisement');



        // for my product of seller    
        app.get('/products/:email', async (req, res) => {
            const email = req.params.email;
            // const result = await categoriesCollection
            //     .find({ products: { $elemMatch: { sellerEmail: email } } })
            //     .project({ products: 1, _id: 0 })
            //     .toArray();

            const result = await categoriesCollection.aggregate([
                {
                    $match: {
                        "products.sellerEmail": email
                    }
                },
                {
                    $project: {
                        "products": {
                            $filter: {
                                input: "$products",
                                cond: {
                                    $eq: [
                                        "$$this.sellerEmail",
                                        email
                                    ]
                                }
                            }
                        }
                    }
                }
            ]).toArray()

            res.send(result);
        })


        // delete user => OK
        app.delete('/user/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })



        // delete product => OK 
        app.post('/myproducts/delete/:id', async (req, res) => {
            const id = req.params.id;
            const company = req.body.company;
            const filter = { categoryName: company };
            const options = { multi: true };
            const updatedDoc = {
                $pull: { products: { _id: ObjectId(id) } }
            }
            const result = await categoriesCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })



        // for getting My orders for Buyer
        //  Used in MyOrders.js
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { buyerEmail: email };
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings);
        })



        // for creating booking database => OK
        // Used in category.js  AdvertisedITems.js
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })



        // for showing advertied ITems in Homepage => OK
        app.get('/advertise', async (req, res) => {
            const result = await advertiseCollection.find({}).toArray();
            res.send(result);
        })



        // for adding products into advertisement db => OK
        app.post('/advertise', async (req, res) => {
            const advertisementData = req.body;
            const filter = { oldID: advertisementData.oldID };
            const options = { upsert: true };
            const updatedDoc = {
                $set: advertisementData
            }
            const result = await advertiseCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })



        // for loading all categories. => OK
        app.get('/categories', async (req, res) => {
            const query = {};
            const cursor = categoriesCollection.find(query);
            const categories = await cursor.toArray();
            res.send(categories);
        });



        // to load all products under specified category. => OK
        app.get('/category/:categoryId', async (req, res) => {
            const id = req.params.categoryId;
            const query = { _id: ObjectId(id) };
            const category = await categoriesCollection.findOne(query);
            res.send(category);
        });



        // Adding products for seller => OK
        app.post('/category/:categoryName', async (req, res) => {
            const name = req.params.categoryName;
            const newProduct = req.body;
            newProduct._id = ObjectId();
            const query = { categoryName: name }
            const result = await categoriesCollection.updateOne(query, { $push: { "products": newProduct } });
            res.send(result);
        })



        // for posting user information to db => OK
        app.post('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updatedDoc = {
                $set: user
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })



        // for getting All Sellers or Buyers => OK
        app.get('/users', async (req, res) => {
            const userType = req.query.userType;
            const query = { buyerOrSeller: userType };
            const allSellers = await usersCollection.find(query).toArray();
            res.send(allSellers);
        })



        // for getting specific Sellers or Buyers => OK
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send(user);
        })



        // for verifiying the seller => OK
        app.put('/user/verification/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    isVerified: true
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })







        // checkig if the user is admin  => OK
        app.get('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })



        // checkig if the user is Seller  => OK
        app.get('/user/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.buyerOrSeller === 'Seller' });
        })



        // checkig if the user is Buyer  => OK
        app.get('/user/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isBuyer: user?.buyerOrSeller === 'Buyer' });
        })



        // Making a User admin  => OK
        app.put('/user/admin/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const options = { upser: true };
            const updatedDoc = {
                $set: {
                    role: "admin"
                }
            }
            const result = await usersCollection.updateOne(query, updatedDoc, options);
            res.send(result);
        });
    }
    finally { }
}
run().catch(er => console.error(er));






/*************** 
    Operation
***************/

app.get('/', (req, res) => {
    res.send('Server is okay.')
})

app.listen(port, () => {
    console.log(`server is running on port - ${port}`)
})
