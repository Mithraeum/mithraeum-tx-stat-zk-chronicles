import {Transfer} from "../generated/templates/Workers/Workers";
import {createTx} from "./_txLogger";

export function handleWorkersTransfer(event: Transfer): void {
    createTx(event);
}