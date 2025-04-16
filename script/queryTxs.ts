import {ethers} from "ethers";
import {convertArrayOfObjectsToCsvString, convertCsvStringToArrayOfObjects} from "./csv";

const fs = require('fs');

interface Tx {
    id: string;
    blockNumber: string | undefined;
    time: string | undefined;
    gasLimit: string | undefined;
    gasUsed: string | undefined;
    gasPrice: string | undefined;
    from: string | undefined;
}

export async function requestBatch(graphRequestUrl: string, time: bigint): Promise<Tx[]> {
    const response = await fetch(graphRequestUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
            query: `{
              txes(orderBy: time, orderDirection: asc, first: 500, where: {time_gte: ${time.toString(10)} }) {
                id
                blockNumber
                time
                gasLimit
              }
            }`
        })
    });
    return (await response.json())["data"]["txes"];
}

function saveJsonToFile(fileName: string, jsonObjectFromFile: {[key: string]: any}) {
    // fs.writeFileSync(fileName, JSON.stringify(jsonObjectFromFile,(_, v) => typeof v === 'bigint' ? v.toString() : v, "\t"));
    fs.writeFileSync(fileName, convertArrayOfObjectsToCsvString(Object.values(jsonObjectFromFile)));
}

function getJsonObjectFromFileData(fileName: string): { [key: string]: Tx } | null {
    // const fileData = fs.readFileSync(fileName);
    //
    // try {
    //     // JSON.parse is able to parse buffer, ts just doesn't know about it
    //     // @ts-ignore
    //     return JSON.parse(fileData);
    // } catch (e) {
    //     return null;
    // }

    const fileString = fs.readFileSync(fileName, "utf-8");
    const items = convertCsvStringToArrayOfObjects(fileString) as Tx[];
    return items.reduce((result, item) => {
        result[item.id] = item;
        return result;
    }, {} as { [key: string]: Tx })
}

async function getMaxTimeFromFile(fileName: string) {
    if (!fs.existsSync(fileName)) {
        return BigInt(0);
    }

    let jsonObjectFromFile = getJsonObjectFromFileData(fileName);
    if (jsonObjectFromFile == null) {
        return BigInt(0);
    }

    let txs = Object.values(jsonObjectFromFile);
    return getMaxTimeFromTxs(txs);
}

function getMaxTimeFromTxs(txs: any[]) {
    const maxTime = txs.reduce((max, current) => {
        const potentialMax = BigInt(current.time)
        if (potentialMax > max) {
            return potentialMax;
        }

        return max;
    }, BigInt(0));

    return maxTime;
}

async function writeTxsToFile(fileName: string, txs: Tx[]) {
    // Creates empty json file if no file found
    if (!fs.existsSync(fileName)) {
        saveJsonToFile(fileName, {});
    }

    let jsonObjectFromFile = getJsonObjectFromFileData(fileName);
    if (jsonObjectFromFile == null) {
        jsonObjectFromFile = {};
    }

    txs.forEach(tx => {
        if (jsonObjectFromFile![tx.id]) {
            jsonObjectFromFile![tx.id] = {
                ...jsonObjectFromFile![tx.id],
                ...tx
            };
        } else {
            jsonObjectFromFile![tx.id] = {
                ...tx
            };
        }
    });


    // Save pretty json object to file
    saveJsonToFile(fileName, jsonObjectFromFile);
}

function isSameTxs(txs1: any[], txs2: any[]) {
    if (txs1.length !== txs2.length) {
        return false;
    }

    const ids1 = txs1.map(tx => tx.id);
    const ids2 = txs2.map(tx => tx.id);

    const obj1 = {} as {[key: string]: boolean};
    ids1.forEach(id => {
        obj1[id] = true;
    })

    return ids2.filter(id => !obj1[id]).length === 0;
}

async function main() {
    // const fileName = "zkSyncChroniclesTxs.data.json";
    const fileName = "soneiumTxs.data.csv";

    // const graphRequestUrl = "https://api.studio.thegraph.com/query/72578/mithraeum-zk-chronicles-with-tx-stat/version/latest";//zk sync
    const graphRequestUrl = "https://api.studio.thegraph.com/query/72578/mithraeum-tx-stat-soneium/version/latest";//soneium

    // const rpcUrl = 'https://mainnet.era.zksync.io';
    const rpcUrl = 'https://rpc.soneium.org/';

    let maxTime = BigInt(0);
    let newTxs: Tx[] = [];
    let oldTxs: Tx[] = [];
    do {
        maxTime = await getMaxTimeFromFile(fileName);
        newTxs = await requestBatch(graphRequestUrl, maxTime);

        if (isSameTxs(oldTxs, newTxs)) {
            console.log("getting same result, breaking");
            break;
        }

        // console.log(newTxs);
        await writeTxsToFile(fileName, newTxs);

        console.log(`newTxs ${newTxs.length} saved`);

        oldTxs = [...newTxs];
    } while (newTxs.length > 0);

    console.log("enriching txs with data from rpc node (this data is unavailable in thegraph)");

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const allTxs = Object.values(getJsonObjectFromFileData(fileName) as { [key: string]: Tx });
    const txsWithoutFromValue = allTxs.filter(tx => tx.from === undefined);
    const batchSize = 10;

    let notYetPersistedTxs = [];

    for (let i = 0; i < txsWithoutFromValue.length; i += batchSize) {
        const startOffset = i;
        const endOffset = Math.min(i + batchSize, txsWithoutFromValue.length);
        const isLastBatch = endOffset === txsWithoutFromValue.length;
        const shouldPersistInThisBatch = isLastBatch || notYetPersistedTxs.length >= 1000;

        const txBatch = [];
        for (let j = startOffset; j < endOffset; j++) {
            txBatch.push(txsWithoutFromValue[j]);
        }

        const processTx = async (tx: any): Promise<Tx | null> => {
            const receipt = await provider.getTransactionReceipt(tx.id);
            if (!receipt) {
                console.log(`tx has no receipt`);
                return null;
            }

            tx.from = receipt.from.toString();
            tx.gasUsed = receipt.gasUsed.toString();
            tx.gasPrice = receipt.gasPrice.toString();

            return tx;
        }

        const processedTxs = await Promise.all(
            txBatch.map(async tx => {
                return await processTx(tx);
            })
        );

        const nonNullProcessedTxs = processedTxs.filter(tx => tx !== null);

        nonNullProcessedTxs.forEach(tx => {
            console.log(`tx ${tx.id} has ${tx.gasUsed} gas used, i = ${i}, length = ${txsWithoutFromValue.length}`)
        });

        for (let j = 0; j < nonNullProcessedTxs.length; j++) {
            notYetPersistedTxs.push(nonNullProcessedTxs[j]);
        }

        if (shouldPersistInThisBatch) {
            await writeTxsToFile(fileName, notYetPersistedTxs);
            console.log(`Saved ${notYetPersistedTxs.length} txs to file`);
            notYetPersistedTxs = [];
        }
    }

    let allSavedTxs = Object.values(getJsonObjectFromFileData(fileName) as { [key: string]: Tx });

    // filtering txs by some date
    allSavedTxs = allSavedTxs.filter(tx => {

        const itemDateTime = new Date(Number(tx.time) * 1000).getTime();

        //YYYY-MM-DD
        const desiredFromDateTime = new Date('2025-04-07 00:00:00 GMT+3').getTime();
        const desiredToDateTime =   new Date('2025-04-16 23:59:59 GMT+3').getTime();

        return itemDateTime >= desiredFromDateTime && itemDateTime <= desiredToDateTime;
    });

    const totalEthUsedForTxs = Object.values(allSavedTxs).reduce((sum, item) => sum + BigInt(item.gasUsed!) * BigInt(item.gasPrice!), BigInt(0));
    const ethPrice = 2000;

    console.log('total tx count', allSavedTxs.length);
    console.log('totalEthUsedForTxs', totalEthUsedForTxs);
    console.log('totalEthUsedForTxs in number', Number(totalEthUsedForTxs) / 1e18);
    console.log(`totalEthUsedForTxs in usd (price is ${ethPrice} and it is specified in code)`, Number(totalEthUsedForTxs) / 1e18 * ethPrice);

    // Grouped txs by day in 'day.month.year' format
    const groupedByDayTxs = allSavedTxs.reduce((group, item: any) => {
        const itemDate = new Date(Number(item.time) * 1000);
        const year = itemDate.getFullYear();
        const month = itemDate.getMonth() + 1;
        const day = itemDate.getDate();

        const key = `${day}.${month}.${year}`;

        if (!group[key]) {
            group[key] = [];
        }

        group[key].push(item);
        return group;
    }, {} as any);

    // console.log(groupedByDayTxs);

    // Tx count by day
    const txsCountByDay = Object.entries(groupedByDayTxs).map(([key, value]: [any, any]) => {
        return [key, value.length];
    });

    console.log('tx counts by day', txsCountByDay);

    // Max transactions in one day
    let maxTxByDay = txsCountByDay[0];
    for (let i = 0; i < txsCountByDay.length; i++) {
        if (txsCountByDay[i][1] > maxTxByDay[1]) {
            maxTxByDay = txsCountByDay[i];
        }
    }

    console.log('maxTxInDay', maxTxByDay);
    console.log(`First tx in a list ${new Date(Number(allSavedTxs[0].time) * 1000)}`);
    console.log(`Last tx in a list ${new Date(Number(allSavedTxs[allSavedTxs.length - 1].time) * 1000)}`);
}

main();