import { describe, expect, test } from 'vitest';
import { getAuthHeader } from './getAuthHeader';

describe('getAuthHeader', () => {
  test('returns a bearer header when a token is stored', () => {
    // Arrange
    localStorage.setItem('token', 'abc.def.ghi');

    // Act
    const header = getAuthHeader();

    // Assert
    expect(header).toEqual({ Authorization: 'Bearer abc.def.ghi' });
  });

  test('returns an empty object when no token is stored', () => {
    const header = getAuthHeader();

    expect(header).toEqual({});
  });

  test('returns an empty object when the stored token is an empty string', () => {
    localStorage.setItem('token', '');

    const header = getAuthHeader();

    expect(header).toEqual({});
  });
});
