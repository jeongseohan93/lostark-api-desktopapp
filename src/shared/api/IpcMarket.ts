import { MarketSearchBody } from '../types/lostark.types';

const api = () => {
    if (!window.lostarkAPI) throw new Error('IPC bridge is not available.');
    return window.lostarkAPI;
};

export const getMarketsOptions = () => api().getMarketsOptions();
export const searchMarketItems = (body: MarketSearchBody) => api().searchMarketItems(body);
