// required
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
// const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.LANTABUR_USER}:${process.env.LANTABUR_PASSWORD}@asadaman42.mzbtlu2.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try{
        const serviceCollection = client.db('LanTaburTv').collection('categories');
        
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);



    }

    finally{

    }
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
