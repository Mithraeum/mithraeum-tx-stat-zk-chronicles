import { TransferBatch, TransferSingle } from "../generated/Distributions/Distributions";
import {createTx} from "./_txLogger";

export function handleTransferSingle(event: TransferSingle): void {
  createTx(event);
}

export function handleTransferBatch(event: TransferBatch): void {
  createTx(event);
}
