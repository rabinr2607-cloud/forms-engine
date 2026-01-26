import { InjectionToken } from '@angular/core';

export const VALIDATION_ERROR_MESSAGES = new InjectionToken<Record<string, string>>(
    'VALIDATION_ERROR_MESSAGES',
    {
        providedIn: 'root',
        factory: () => ({
            // Basic validators
            required: 'This field is required',
            email: 'Enter a valid email address',

            // Length validators (parameterized)
            minlength: 'Minimum {{requiredLength}} characters required',
            maxlength: 'Maximum {{requiredLength}} characters allowed',

            // Number validators (parameterized)
            min: 'Minimum value is {{min}}',
            max: 'Maximum value is {{max}}',

            // Pattern
            pattern: 'Invalid format',

            // Custom validators
            passwordMismatch: 'Passwords do not match',
            passwordStrength: 'Password must contain uppercase, lowercase, number and special character',
            invalidPhone: 'Enter a valid phone number',
            invalidZipCode: 'Enter a valid ZIP code',
            futureDate: 'Date must be in the future',
            pastDate: 'Date must be in the past',

            // Async validators
            emailTaken: 'This email is already registered',
            usernameTaken: 'This username is not available'
        })
    }
);