import {ArmyLiquidated, ArmySiegeModified, BuildingRobbed} from "../generated/templates/Siege/Siege";
import {createTx} from "./_txLogger";

export function handleArmySiegeModified(event: ArmySiegeModified): void {
  createTx(event);
}

export function handleBuildingRobbed(event: BuildingRobbed): void {
  createTx(event);
}

export function handleArmyLiquidated(event: ArmyLiquidated): void {
  createTx(event);
}
