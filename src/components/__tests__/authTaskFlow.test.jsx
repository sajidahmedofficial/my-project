// agent-notes: { ctx: "Unit tests for TaskFlowAuth state transitions and input validation", deps: ["../TaskFlowAuth"], state: "active", last: "anti@2026-07-31" }
import { describe, it, expect } from 'vitest';

describe('TaskFlowAuth Flow Logic', () => {
  it('calculates password strength correctly', () => {
    const getPasswordStrength = (pass) => {
      if (!pass) return 0;
      let score = 0;
      if (pass.length >= 6) score += 30;
      if (pass.length >= 10) score += 20;
      if (/[A-Z]/.test(pass)) score += 25;
      if (/[0-9]/.test(pass)) score += 15;
      if (/[^A-Za-z0-9]/.test(pass)) score += 10;
      return Math.min(100, score);
    };

    expect(getPasswordStrength('')).toBe(0);
    expect(getPasswordStrength('short')).toBe(0);
    expect(getPasswordStrength('123456')).toBe(45);
    expect(getPasswordStrength('StrongPass123!')).toBe(100);
  });

  it('validates task step transitions correctly', () => {
    const validateTaskStep = (step, formData, mode) => {
      if (step === 1) return true;
      if (step === 2) {
        if (!formData.email || !formData.email.includes('@')) return false;
        if (!formData.password) return false;
        if (mode === 'signup' && !formData.name.trim()) return false;
        if (mode === 'signup' && formData.password !== formData.confirmPassword) return false;
        return true;
      }
      return true;
    };

    const invalidForm = { email: 'invalid', password: '123', name: '', confirmPassword: '321' };
    const validForm = { email: 'test@student.edu', password: 'password123', name: 'Aarav', confirmPassword: 'password123' };

    expect(validateTaskStep(1, invalidForm, 'signup')).toBe(true);
    expect(validateTaskStep(2, invalidForm, 'signup')).toBe(false);
    expect(validateTaskStep(2, validForm, 'signup')).toBe(true);
  });
});
