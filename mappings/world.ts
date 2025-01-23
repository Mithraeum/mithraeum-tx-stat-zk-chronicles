import {
  CurrentEraNumberUpdated,
  GameEndTimeUpdated,
  GameBeginTimeUpdated,
  EraCreated,
  WorldInitialized
} from "../generated/World/World";
import {Era as EraTemplate} from "../generated/templates";
import {createTx} from "./_txLogger";

export function handleWorldInitialized(event: WorldInitialized): void {
  createTx(event);
}

export function handleGameBeginTimeUpdated(event: GameBeginTimeUpdated): void {
  createTx(event);
}

export function handleGameEndTimeUpdated(event: GameEndTimeUpdated): void {
  createTx(event);
}

export function handleEraCreated(event: EraCreated): void {
  createTx(event);
  EraTemplate.create(event.params.newEraAddress);
}

export function handleCurrentEraNumberUpdated(event: CurrentEraNumberUpdated): void {
  createTx(event);
}
