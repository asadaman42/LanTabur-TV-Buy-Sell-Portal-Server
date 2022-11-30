// required
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const e = require('express');
require('dotenv').config();
// const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.LANTABUR_USER}:${process.env.LANTABUR_PASSWORD}@asadaman42.mzbtlu2.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



const run = async () => {
    try {
        const categoriesCollection = client.db('LanTaburTv').collection('categories');
        const bookingCollection = client.db('LanTaburTv').collection('bookings');
        const usersCollection = client.db('LanTaburTv').collection('users');



        // for loading all categories.
        app.get('/categories', async (req, res) => {
            const query = {};
            const cursor = categoriesCollection.find(query);
            const categories = await cursor.toArray();
            res.send(categories);
        });

        // to load all products under specified category.
        app.get('/category/:categoryId', async (req, res) => {
            const id = req.params.categoryId;
            const query = { _id: ObjectId(id) };
            const category = await categoriesCollection.findOne(query);
            res.send(category);
        });

        // for add products
        app.post('/category/:categoryName', async (req, res) => {
            const name = req.params.categoryName;
            const newProduct = req.body;
            newProduct._id = ObjectId();
            const query = { categoryName: name }
            const result = await categoriesCollection.updateOne(query, { $push: { "products": newProduct } });
            res.send(result);
        })

        // for creating booking database
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })

        // for getting My products for seller
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { buyerEmail: email };
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings);
        })

        // for posting user information to db
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })


        // for getting All Sellers or Buyers
        app.get('/users', async (req, res) => {
            const userType = req.query.userType;
            const query = { buyerOrSeller: userType };
            const allSellers = await usersCollection.find(query).toArray();
            res.send(allSellers);
        })

        // for verifiying the seller
        app.put('/user/verification/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upser: true };
            const updatedDoc = {
                $set: {
                    isVerified: true
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        // delete user 
        app.delete('/user/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })




        // checkig if the user is admin 
        app.get('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })

        

        // Making a User admin 
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
        })




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
