import {
  BuildingCreated,
  ArmyCreated,
  GovernorStatusChanged,
  GovernorsGenerationChanged,
  SiegeCreated, Destroyed
} from "../generated/templates/Settlement/Settlement";

import {
  Building as BuildingTemplate,
  Army as ArmyTemplate,
  Siege as SiegeTemplate
} from "../generated/templates";
import {createTx} from "./_txLogger";

export function handleBuildingCreated(event: BuildingCreated): void {
  createTx(event);
  BuildingTemplate.create(event.params.buildingAddress);
}

export function handleArmyCreated(event: ArmyCreated): void {
  createTx(event);
  ArmyTemplate.create(event.params.armyAddress);
}

export function handleSiegeCreated(event: SiegeCreated): void {
  createTx(event);
  SiegeTemplate.create(event.params.siegeAddress);
}

export function handleGovernorStatusChanged(event: GovernorStatusChanged): void {
  createTx(event);
}

export function handleGovernorsGenerationChanged(event: GovernorsGenerationChanged): void {
  createTx(event);
}

export function handleDestroyed(event: Destroyed): void {
  createTx(event);
}
