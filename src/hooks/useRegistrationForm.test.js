import { renderHook, act } from '@testing-library/react-hooks';
import { useRegistrationForm } from './useRegistrationForm';
import * as useAuth from './useAuth';

// Mock the useAuth hook
jest.mock('./useAuth', () => ({
  __esModule: true,
  default: () => ({ token: 'test-token' }),
}));

describe('useRegistrationForm', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useRegistrationForm());

    expect(result.current.formData).toEqual({
      name: '',
      birthDate: '',
      cpf: '',
      email: '',
      description: '',
    });
    expect(result.current.submitted).toBeNull();
    expect(result.current.status).toBe('idle');
    expect(result.current.errorMessage).toBe('');
  });

  it('should handle form input changes', () => {
    const { result } = renderHook(() => useRegistrationForm());

    act(() => {
      result.current.handleChange({ target: { name: 'name', value: 'John Doe' } });
    });

    expect(result.current.formData.name).toBe('John Doe');
  });

  it('should format CPF on change', () => {
    const { result } = renderHook(() => useRegistrationForm());

    act(() => {
      result.current.handleChange({ target: { name: 'cpf', value: '12345678901' } });
    });

    expect(result.current.formData.cpf).toBe('123.456.789-01');
  });

  it('should reset the form', () => {
    const { result } = renderHook(() => useRegistrationForm());

    act(() => {
      result.current.handleChange({ target: { name: 'name', value: 'John Doe' } });
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.formData).toEqual({
      name: '',
      birthDate: '',
      cpf: '',
      email: '',
      description: '',
    });
  });
});
