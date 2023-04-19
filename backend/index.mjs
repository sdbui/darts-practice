import express from 'express';
const app = express();
import http from 'http';
import dotenv from 'dotenv';
dotenv.config();
import db from './db/conn.mjs'
import cors from 'cors'
app.use(cors());


app.get('/api/results', async (req, res, next) => {
    try {
        // get all the stats
        const collection = await db.collection('mockResults'); // TODO: Use results db instead once it is populated enough
        let result = await collection.find({})
            .limit(30)
            .toArray()
        console.log(result)
        res.status(200).json(result);
    } catch (e) {
        res.status(400).send('uh OH!')
    }
});


const server = http.createServer(app);
server.listen(process.env.PORT, () => {
    console.log(`app listening on port ${process.env.PORT}`);
})