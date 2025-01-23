import {UnitsBought} from "../generated/templates/UnitsPool/UnitsPool";
import {createTx} from "./_txLogger";

export function handleUnitsBought(event: UnitsBought): void {
    createTx(event);
}