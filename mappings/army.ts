import {
    BattleCreated,
    JoinedBattle,
    ManeuveringBegan,
    SecretManeuverCancelled,
    UnitsDemilitarized,
    UpdatedPosition,
} from "../generated/templates/Army/Army";
import {Battle as BattleTemplate} from "../generated/templates";
import {createTx} from "./_txLogger";

export function handleManeuveringBegan(event: ManeuveringBegan): void {
    createTx(event);
}

export function handleSecretManeuverCancelled(event: SecretManeuverCancelled): void {
    createTx(event);
}

export function handleUnitsDemilitarized(event: UnitsDemilitarized): void {
    createTx(event);
}

export function handleJoinedBattle(event: JoinedBattle): void {
    createTx(event);
}

export function handleUpdatedPosition(event: UpdatedPosition): void {
    createTx(event);
}

export function handleBattleCreated(event: BattleCreated): void {
    createTx(event);
    BattleTemplate.create(event.params.battleAddress);
}
