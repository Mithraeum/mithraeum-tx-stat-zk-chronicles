import {
    BasicProductionUpgraded,
    AdvancedProductionUpgraded,
    DistributionCreated, DistributedToShareHolder
} from "../generated/templates/Building/Building";

import {createTx} from "./_txLogger";

export function handleDistributedToShareHolder(event: DistributedToShareHolder): void {
    createTx(event);
}

export function handleBasicProductionUpgraded(event: BasicProductionUpgraded): void {
    createTx(event);
}

export function handleAdvancedProductionUpgraded(event: AdvancedProductionUpgraded): void {
    createTx(event);
}

export function handleDistributionCreated(event: DistributionCreated): void {
    createTx(event);
}
