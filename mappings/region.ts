import {
    SettlementsMarketCreated,
    CorruptionIndexDecreased,
    CorruptionIndexIncreased,
    UnitsPoolCreated,
    WorkersPoolCreated
} from "../generated/templates/Region/Region";

import {WorkersPool as WorkerPoolTemplate} from "../generated/templates";
import {SettlementsMarket as SettlementsMarketTemplate} from "../generated/templates";
import {UnitsPool as UnitsPoolTemplate} from "../generated/templates";
import {createTx} from "./_txLogger";

export function handleWorkersPoolCreated(event: WorkersPoolCreated): void {
    createTx(event);
    WorkerPoolTemplate.create(event.params.workersPoolAddress);
}

export function handleUnitsPoolCreated(event: UnitsPoolCreated): void {
    createTx(event);
    UnitsPoolTemplate.create(event.params.unitsPoolAddress);
}

export function handleSettlementsMarketCreated(event: SettlementsMarketCreated): void {
    createTx(event);
    SettlementsMarketTemplate.create(event.params.settlementsMarketAddress);
}

export function handleCorruptionIndexIncreased(event: CorruptionIndexIncreased): void {
    createTx(event);
}

export function handleCorruptionIndexDecreased(event: CorruptionIndexDecreased): void {
    createTx(event);
}
