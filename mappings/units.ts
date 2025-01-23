import {Transfer} from "../generated/templates/Units/Units";
import {createTx} from "./_txLogger";

export function handleUnitsTransfer(event: Transfer): void {
    createTx(event);
}