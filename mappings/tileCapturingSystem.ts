import {
  CapturedTileClaimed, CapturedTileGivenUp,
  TileCapturingCancelled,
  TileCapturingBegan
} from "../generated/templates/TileCapturingSystem/TileCapturingSystem";
import {createTx} from "./_txLogger";

export function handleTileCapturingBegan(event: TileCapturingBegan): void {
  createTx(event);
}

export function handleTileCapturingCancelled(event: TileCapturingCancelled): void {
  createTx(event);
}

export function handleCapturedTileClaimed(event: CapturedTileClaimed): void {
  createTx(event);
}

export function handleCapturedTileGivenUp(event: CapturedTileGivenUp): void {
  createTx(event);
}
