import {
    ProsperityCreated,
    ResourceCreated,
    SettlementCreated,
    SettlementRestored,
    TileCapturingSystemCreated,
    UnitsCreated,
    WorkersCreated,
    RegionActivated
} from "../generated/templates/Era/Era";
import {
    Units as UnitsTemplate,
    Workers as WorkersTemplate,
    Resource as ResourceTemplate,
    Region as RegionTemplate,
    Settlement as SettlementTemplate,
    TileCapturingSystem as TileCapturingSystemTemplate
} from "../generated/templates";
import {createTx} from "./_txLogger";

export function handleResourceCreated(event: ResourceCreated): void {
    createTx(event);
    ResourceTemplate.create(event.params.resourceAddress);
}

export function handleUnitsCreated(event: UnitsCreated): void {
    createTx(event);
    UnitsTemplate.create(event.params.unitsAddress);
}

export function handleWorkersCreated(event: WorkersCreated): void {
    createTx(event);
    WorkersTemplate.create(event.params.workersAddress);
}

export function handleProsperityCreated(event: ProsperityCreated): void {
    createTx(event);
    //todo if units handler is needed
}

export function handleTileCapturingSystemCreated(event: TileCapturingSystemCreated): void {
    createTx(event);
    TileCapturingSystemTemplate.create(event.params.tileCapturingSystemAddress);
}

export function handleRegionActivated(event: RegionActivated): void {
    createTx(event);
    RegionTemplate.create(event.params.regionAddress);
}

export function handleSettlementCreated(event: SettlementCreated): void {
    createTx(event);
    SettlementTemplate.create(event.params.settlementAddress);
}

export function handleSettlementRestored(event: SettlementRestored): void {
    createTx(event);
}