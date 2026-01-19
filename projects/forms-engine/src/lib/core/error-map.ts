import { InjectionToken } from '@angular/core';

export const VALIDATION_ERROR_MESSAGES = new InjectionToken<Record<string, string>>('VALIDATION_ERROR_MESSAGES', {
    providedIn: 'root',
    factory: () => defaultErrors
});

export const defaultErrors: Record<string, string> = {
    required: 'This field is required',
    email: 'Invalid email address',
    minlength: 'Value is too short',
    maxlength: 'Value is too long',
    min: 'Value is too small',
    max: 'Value is too large',
    pattern: 'Invalid format'
};
