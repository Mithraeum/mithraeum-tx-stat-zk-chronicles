import {BannerCreated, BannerUpdated} from "../generated/Banner/Banners";
import {createTx} from "./_txLogger";

export function handleBannerCreated(event: BannerCreated): void {
    createTx(event);
}

export function handleBannerUpdated(event: BannerUpdated): void {
    createTx(event);
}


