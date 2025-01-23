import {Transfer} from "../generated/Erc20ForSettlementPurchase/IERC20";
import {createTx} from "./_txLogger";

export function handleErc20ForSettlementPurchaseTransfer(event: Transfer): void {
    createTx(event);
}