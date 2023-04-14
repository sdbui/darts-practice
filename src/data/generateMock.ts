import { faker } from '@faker-js/faker';
import fs from 'fs';
import {
    Accuracy,
    GameResult
} from '../common/types';

const MOCK_PATH = './mockResults.json';

function createRandomGameResult(): GameResult {
    let result = {} as GameResult;
    result.rounds = faker.datatype.number({
        min: 45,
        max: 120
    });


    let targets = [20,19,18,17,16,15,14,13,'B'];
    result.accuracy = {} as Accuracy;
    let sum = 0;
    for (let target of targets) {
        (result.accuracy as any)[target] = faker.datatype.float({
            min: 0.01,
            max: 1.00,
        });
        sum+= (result.accuracy as any)[target];
    }

    result.accuracy.overall = parseFloat((sum / targets.length).toFixed(2));
    return <GameResult> result;
}

let list = [];
for (let i =0; i < 30; i++) {
    list.push(createRandomGameResult());
}
try {
    if (fs.existsSync(MOCK_PATH)) {
        // rename current file and move to 'old' directory
        let timestamp = Date.now();
        if (!fs.existsSync('./old')) {
            fs.mkdirSync('./old');
        }
        fs.renameSync(MOCK_PATH, `./old/${timestamp}.json`);
    }
    // doesnt exist, simply create it
    fs.writeFileSync(MOCK_PATH, JSON.stringify(list, null, 4),'utf8');
} catch (err) {
    console.error('Something wrong!')
    console.error(err);
}