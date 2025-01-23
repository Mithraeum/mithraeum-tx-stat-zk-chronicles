import {WorkersBought} from "../generated/templates/WorkersPool/WorkersPool";
import {createTx} from "./_txLogger";

export function handleWorkersBought(event: WorkersBought): void {
  createTx(event);
}
