/**
 * Simple AuthContext tests
 */
import { AuthContext } from '../AuthContext';

describe('AuthContext', () => {
  test('should be defined', () => {
    expect(AuthContext).toBeDefined();
  });

  test('should have default context structure', () => {
    const defaultValue = AuthContext._currentValue;
    expect(defaultValue).toBeDefined();
    expect(typeof defaultValue.signIn).toBe('function');
    expect(typeof defaultValue.signOut).toBe('function');
    expect(defaultValue.user).toBeNull();
    expect(defaultValue.token).toBeNull();
  });
});
