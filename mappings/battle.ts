import {BattleEnded} from "../generated/templates/Battle/Battle";
import {createTx} from "./_txLogger";

export function handleBattleEnded(event: BattleEnded): void {
    createTx(event);
}
