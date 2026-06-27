import { AuctionSearchBody } from '../types/lostark.types';

const api = () => {
    if (!window.lostarkAPI) throw new Error('IPC bridge is not available.');
    return window.lostarkAPI;
};

export const getAuctionsOptions = () => api().getAuctionsOptions();
export const searchAuctionItems = (body: AuctionSearchBody) => api().searchAuctionItems(body);
