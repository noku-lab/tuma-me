import { AuthContext } from '../AuthContext';

describe('AuthContext', () => {
  test('should have default values', () => {
    expect(AuthContext).toBeDefined();
    expect(AuthContext._currentValue).toBeDefined();
    expect(AuthContext._currentValue.signIn).toBeDefined();
    expect(AuthContext._currentValue.signOut).toBeDefined();
    expect(AuthContext._currentValue.user).toBeNull();
    expect(AuthContext._currentValue.token).toBeNull();
  });

  test('should have signIn function', () => {
    expect(typeof AuthContext._currentValue.signIn).toBe('function');
  });

  test('should have signOut function', () => {
    expect(typeof AuthContext._currentValue.signOut).toBe('function');
  });
});
