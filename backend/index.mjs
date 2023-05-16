import express from 'express';
const app = express();
import http from 'http';
import dotenv from 'dotenv';
dotenv.config();
import db from './db/conn.mjs'
import cors from 'cors'
app.use(cors());
import bodyParser from 'body-parser';

app.use(bodyParser.json());

app.get('/api/results', async (req, res, next) => {
    let { count=100, board='soft' } = req.query;
    try {
        // get all the stats
        const collection = await db.collection('results');
        let countDocs = await collection.countDocuments({board});
        let result = await collection.find({board})
            .skip(Math.max(countDocs - count, 0))
            .limit(100)
            .toArray()
        res.status(200).json(result);
    } catch (e) {
        res.status(400).send('uh OH!')
    }
});

app.post('/api/results', async (req, res, next) => {
    let { rounds, accuracy, board } = req.body;

    const format = (num) => {
        return (num * 100).toFixed(2);
    }
    let formattedAccuracy = {};
    for (let key in accuracy) {
        let {hit, thrown} = accuracy[key];
        formattedAccuracy[key] = parseFloat(format(hit / thrown));
    }

    try {
        const collection = await db.collection('results');
        let response = await collection.insertOne({
            rounds,
            board,
            accuracy: formattedAccuracy 
        });
        res.status(200).json('ok!');
    } catch (e) {
        res.status(400).send('something wrong with post')
    }
})


const server = http.createServer(app);
server.listen(process.env.PORT, () => {
    console.log(`app listening on port ${process.env.PORT}`);
})