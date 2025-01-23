import {BigInt, ethereum} from "@graphprotocol/graph-ts";
import {Tx} from "../generated/schema";

export function createTx(event: ethereum.Event): void {
    const txEntity = Tx.load(event.transaction.hash.toHex().toLowerCase());
    if (txEntity != null) {

        let isEntityChanged = false;
        if (event.receipt != null && txEntity.gasUsed.isZero() && !event.receipt!.gasUsed.isZero()) {
            txEntity.gasUsed = event.receipt!.gasUsed;
            isEntityChanged = true;
        }

        if (event.receipt != null && txEntity.cumulativeGasUsed.isZero() && !event.receipt!.cumulativeGasUsed.isZero()) {
            txEntity.cumulativeGasUsed = event.receipt!.cumulativeGasUsed;
            isEntityChanged = true;
        }

        if (isEntityChanged) {
            txEntity.save();
        }

        return;
    }

    const newTxEntity = new Tx(event.transaction.hash.toHex().toLowerCase());
    newTxEntity.blockNumber = event.block.number;
    newTxEntity.time = event.block.timestamp;
    newTxEntity.gasLimit = event.transaction.gasLimit;
    newTxEntity.gasPrice = event.transaction.gasPrice;
    newTxEntity.gasUsed = BigInt.fromI32(0);
    newTxEntity.cumulativeGasUsed = BigInt.fromI32(0);

    if (event.receipt != null) {
        newTxEntity.gasUsed = event.receipt!.gasUsed;
        newTxEntity.cumulativeGasUsed = event.receipt!.cumulativeGasUsed;
    }

    newTxEntity.save();
}