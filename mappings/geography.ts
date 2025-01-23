import {RegionIncluded} from "../generated/Geography/Geography";
import {createTx} from "./_txLogger";

export function handleNewRegionIncluded(event: RegionIncluded): void {
  createTx(event);
}
