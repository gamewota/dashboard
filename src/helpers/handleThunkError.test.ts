import { describe, expect, test, vi } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { handleThunkError } from './handleThunkError';

const makeThunkAPI = () => ({ rejectWithValue: vi.fn((v: string) => v) });

/** Builds a real AxiosError so axios.isAxiosError() recognises it. */
function makeAxiosError(data: unknown, status = 400): AxiosError {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, {
    data,
    status,
    statusText: 'Bad Request',
    headers: {},
    config,
  });
}

describe('handleThunkError', () => {
  test('passes through a string response body', () => {
    const thunkAPI = makeThunkAPI();

    handleThunkError(makeAxiosError('Token expired'), thunkAPI);

    expect(thunkAPI.rejectWithValue).toHaveBeenCalledWith('Token expired');
  });

  test('prefers the message field of an object response body', () => {
    const thunkAPI = makeThunkAPI();

    handleThunkError(makeAxiosError({ message: 'Unauthorized', statusCode: 401 }), thunkAPI);

    expect(thunkAPI.rejectWithValue).toHaveBeenCalledWith('Unauthorized');
  });

  test('serialises an object response body that has no message field', () => {
    const thunkAPI = makeThunkAPI();

    handleThunkError(makeAxiosError({ errors: ['bad name'] }), thunkAPI);

    const value = thunkAPI.rejectWithValue.mock.calls[0][0];
    expect(value).toContain('bad name');
  });

  test('falls back to the error string when there is no response body', () => {
    const thunkAPI = makeThunkAPI();
    const networkError = new AxiosError('Network Error', 'ERR_NETWORK');

    handleThunkError(networkError, thunkAPI);

    const value = thunkAPI.rejectWithValue.mock.calls[0][0];
    expect(value).toContain('Network Error');
  });

  test('stringifies a non-axios error', () => {
    const thunkAPI = makeThunkAPI();

    handleThunkError(new Error('boom'), thunkAPI);

    expect(thunkAPI.rejectWithValue).toHaveBeenCalledWith('Error: boom');
  });

  test('always rejects with a string so rejectValue stays consistent', () => {
    const thunkAPI = makeThunkAPI();

    handleThunkError(makeAxiosError({ message: 'nope' }), thunkAPI);
    handleThunkError('plain string throw', thunkAPI);

    for (const call of thunkAPI.rejectWithValue.mock.calls) {
      expect(typeof call[0]).toBe('string');
    }
  });
});
