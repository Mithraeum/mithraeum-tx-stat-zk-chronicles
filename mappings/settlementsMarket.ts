import {SettlementBought} from "../generated/templates/SettlementsMarket/SettlementsMarket";
import {createTx} from "./_txLogger";

export function handleSettlementBought(event: SettlementBought): void {
    createTx(event);
}