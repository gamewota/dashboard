import { describe, expect, test, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import reducer, {
  fetchGachaPacks,
  fetchGachaPackById,
  fetchGachaPacksDetail,
  createGachaPack,
} from './gachaPackSlice';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

const makeStore = () => configureStore({ reducer: { gachaPack: reducer } });

const PACK = { id: 1, name: 'Starter Pack', price: 100 };

beforeEach(() => {
  localStorage.setItem('token', 'test.jwt.token');
});

describe('gachaPackSlice thunks', () => {
  // Regression guard: GET /gacha/prices returns 401 without a bearer token,
  // so these reads must always send the auth header.
  test('fetchGachaPacks sends the auth header', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [PACK] });
    const store = makeStore();

    await store.dispatch(fetchGachaPacks());

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/gacha/prices'),
      { headers: { Authorization: 'Bearer test.jwt.token' } },
    );
  });

  test('fetchGachaPackById sends the auth header and requests the given id', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: PACK });
    const store = makeStore();

    await store.dispatch(fetchGachaPackById(7));

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/gacha/prices/7'),
      { headers: { Authorization: 'Bearer test.jwt.token' } },
    );
  });

  test('fetchGachaPacksDetail sends the auth header', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    const store = makeStore();

    await store.dispatch(fetchGachaPacksDetail(3));

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/cards/gacha-pack/3'),
      { headers: { Authorization: 'Bearer test.jwt.token' } },
    );
  });

  test('createGachaPack sends the auth header alongside the JSON content type', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: PACK });
    const store = makeStore();

    await store.dispatch(createGachaPack({ name: 'New', price: 50 }));

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/gacha/create-gacha-pack'),
      { name: 'New', price: 50 },
      { headers: { Authorization: 'Bearer test.jwt.token', 'Content-Type': 'application/json' } },
    );
  });

  test('omits the Authorization header entirely when no token is stored', async () => {
    localStorage.clear();
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    const store = makeStore();

    await store.dispatch(fetchGachaPacks());

    expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), { headers: {} });
  });
});

describe('gachaPackSlice reducers', () => {
  test('exposes a loading flag while the list request is in flight', () => {
    const store = makeStore();

    store.dispatch({ type: fetchGachaPacks.pending.type });

    expect(store.getState().gachaPack.listLoading).toBe(true);
    expect(store.getState().gachaPack.error).toBeNull();
  });

  test('stores the returned list and clears loading on success', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [PACK] });
    const store = makeStore();

    await store.dispatch(fetchGachaPacks());

    const state = store.getState().gachaPack;
    expect(state.list).toEqual([PACK]);
    expect(state.listLoading).toBe(false);
  });

  test('surfaces an error message when the list request fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Request failed with status code 401'));
    const store = makeStore();

    await store.dispatch(fetchGachaPacks());

    const state = store.getState().gachaPack;
    expect(state.listLoading).toBe(false);
    expect(state.error).toContain('401');
    expect(state.list).toEqual([]);
  });

  test('tracks list and detail loading independently', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    const store = makeStore();

    store.dispatch({ type: fetchGachaPacks.pending.type });

    expect(store.getState().gachaPack.listLoading).toBe(true);
    expect(store.getState().gachaPack.detailsLoading).toBe(false);
  });
});
