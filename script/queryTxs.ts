import {ethers} from "ethers";

const fs = require('fs');

export async function requestBatch(time: bigint): Promise<any[]> {
    const response = await fetch("https://api.studio.thegraph.com/query/72578/mithraeum-zk-chronicles-with-tx-stat/version/latest", {
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

function getJsonObjectFromFileData(fileData: Buffer): { [key: string]: any } | null {
    try {
        // JSON.parse is able to parse buffer, ts just doesn't know about it
        // @ts-ignore
        return JSON.parse(fileData);
    } catch (e) {
        return null;
    }
}

async function getMaxTimeFromFile(fileName: string) {
    if (!fs.existsSync(fileName)) {
        return BigInt(0);
    }

    const fileData = fs.readFileSync(fileName);
    let jsonObjectFromFile = getJsonObjectFromFileData(fileData);
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

async function writeTxsToFile(fileName: string, txs: any[]) {
    // Creates empty json file if no file found
    if (!fs.existsSync(fileName)) {
        fs.writeFileSync(fileName, JSON.stringify({}));
    }

    const fileData = fs.readFileSync(fileName);
    let jsonObjectFromFile = getJsonObjectFromFileData(fileData);
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
    fs.writeFileSync(fileName, JSON.stringify(jsonObjectFromFile,(_, v) => typeof v === 'bigint' ? v.toString() : v, "\t"));
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
    const fileName = "txs.txt";

    let maxTime = BigInt(0);
    let newTxs: any[] = [];
    let oldTxs: any[] = [];
    do {
        maxTime = await getMaxTimeFromFile(fileName);
        newTxs = await requestBatch(maxTime);

        if (isSameTxs(oldTxs, newTxs)) {
            console.log("getting same result, breaking");
            break;
        }

        // console.log(newTxs);
        await writeTxsToFile(fileName, newTxs);

        // maxTime = await getMaxTimeFromTxs(newTxs);
        // console.log(`Maxtime=${maxTime}`)

        console.log(`newTxs ${newTxs.length} saved`);

        oldTxs = [...newTxs];
    } while (newTxs.length > 0);

    console.log("enriching txs with gasUsage...");

    const provider = new ethers.JsonRpcProvider('https://mainnet.era.zksync.io');

    const allTxs = Object.values(getJsonObjectFromFileData(fs.readFileSync(fileName)) as {id: string, gasUsed: string | undefined, gasPrice: string | undefined}[]);
    const txsWithoutGasUsed = allTxs.filter(tx => tx.gasPrice === undefined);

    for (let i = 0; i < txsWithoutGasUsed.length; i++) {
        const tx = txsWithoutGasUsed[i];
        const receipt = await provider.getTransactionReceipt(tx.id);
        if (!receipt) {
            console.log(`tx has no receipt`);
            continue;
        }


        tx.gasUsed = receipt.gasUsed.toString();
        tx.gasPrice = receipt.gasPrice.toString();

        await writeTxsToFile(fileName, [tx]);


        console.log(`tx ${tx.id} has ${tx.gasUsed} gas used, i = ${i}, length = ${txsWithoutGasUsed.length}`)
    }

    const allSavedTxs = Object.values(getJsonObjectFromFileData(fs.readFileSync(fileName)) as any[]);
    const totalEthUsedForTxs = Object.values(allSavedTxs).reduce((sum, item) => sum + BigInt(item.gasUsed!) * BigInt(item.gasPrice!), BigInt(0));
    const ethPrice = 3800;

    console.log('total tx count', allSavedTxs.length);
    console.log('totalEthUsedForTxs', totalEthUsedForTxs);
    console.log('totalEthUsedForTxs in number', Number(totalEthUsedForTxs) / 1e18);
    console.log(`totalEthUsedForTxs in usd (price is ${ethPrice} and it is specified in code)`, Number(totalEthUsedForTxs) / 1e18 * ethPrice);

    // Grouped txs by day in 'day.month.year' format
    const groupedByDayTxs = allTxs.reduce((group, item: any) => {
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
}

main();