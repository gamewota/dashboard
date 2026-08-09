import { describe, expect, test, vi } from 'vitest';
import { z } from 'zod';
import { validateOrReject } from './validateApi';

const ItemSchema = z.object({ id: z.number(), name: z.string() });

/** Minimal stand-in for the thunkAPI surface validateOrReject touches. */
const makeThunkAPI = () => ({ rejectWithValue: vi.fn((msg: string) => ({ rejected: msg })) });

describe('validateOrReject', () => {
  test('returns the parsed data when the payload matches the schema', () => {
    const thunkAPI = makeThunkAPI();

    const result = validateOrReject(ItemSchema, { id: 1, name: 'Sukinanda' }, thunkAPI);

    expect(result).toEqual({ id: 1, name: 'Sukinanda' });
    expect(thunkAPI.rejectWithValue).not.toHaveBeenCalled();
  });

  test('rejects with a path-qualified message when a field has the wrong type', () => {
    const thunkAPI = makeThunkAPI();

    validateOrReject(ItemSchema, { id: 'nope', name: 'Rapsodi' }, thunkAPI);

    expect(thunkAPI.rejectWithValue).toHaveBeenCalledTimes(1);
    const message = thunkAPI.rejectWithValue.mock.calls[0][0];
    expect(message).toContain('id');
  });

  test('joins multiple issues into one message', () => {
    const thunkAPI = makeThunkAPI();

    validateOrReject(ItemSchema, {}, thunkAPI);

    const message = thunkAPI.rejectWithValue.mock.calls[0][0];
    expect(message).toContain('id');
    expect(message).toContain('name');
    expect(message).toContain(';');
  });

  test('labels a root-level mismatch as <root>', () => {
    const thunkAPI = makeThunkAPI();

    // An array where an object was expected produces a root-level issue.
    validateOrReject(ItemSchema, [], thunkAPI);

    const message = thunkAPI.rejectWithValue.mock.calls[0][0];
    expect(message).toContain('<root>');
  });

  test('strips unknown keys rather than rejecting them', () => {
    const thunkAPI = makeThunkAPI();

    const result = validateOrReject(ItemSchema, { id: 2, name: 'x', extra: true }, thunkAPI);

    expect(result).toEqual({ id: 2, name: 'x' });
    expect(thunkAPI.rejectWithValue).not.toHaveBeenCalled();
  });

  test('rejects null, which is what an unwrapped empty envelope yields', () => {
    const thunkAPI = makeThunkAPI();

    validateOrReject(ItemSchema, null, thunkAPI);

    expect(thunkAPI.rejectWithValue).toHaveBeenCalledTimes(1);
  });
});
