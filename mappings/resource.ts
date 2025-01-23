import { Approval, Transfer } from "../generated/templates/Resource/Resource";
import {createTx} from "./_txLogger";

export function handleResourceTransfer(event: Transfer): void {
    createTx(event);
}

export function handleApproval(event: Approval): void {
    createTx(event);
}
