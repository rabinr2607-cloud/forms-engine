import {
    Directive, inject, signal, computed, effect, input, output,
    viewChild, ElementRef, DestroyRef, OnInit, EffectRef
} from '@angular/core';
import { FormControl, ValidationErrors, Validators } from '@angular/forms';
import { APP_SETTING } from './app-setting.token';
import { VALIDATION_ERROR_MESSAGES } from './error-messages.token';

@Directive()
export abstract class InputControlBase<T> implements OnInit {

    private destroyRef = inject(DestroyRef);
    private errorMessages = inject(VALIDATION_ERROR_MESSAGES);
    protected appSetting = inject(APP_SETTING);

    // Reactive forms integration
    control = input<FormControl<T>>(new FormControl() as FormControl<T>);

    // Field-level state
    value = signal<T | null>(null);
    invalid = signal(false);
    touched = signal(false);
    pending = signal(false);
    disabled = signal(false);
    required = signal(false);
    errors = signal<ValidationErrors | null>(null);

    showError = computed(() => this.invalid() && this.touched());

    private hasRequiredValidator() {
        return this.control().validator?.(new FormControl(''))?.['required'] ?? false;
    }

    // Flags to prevent duplicate initialization
    private signalSyncInitialized = false;
    private validationInitialized = false;
    private validationEffectRef: EffectRef | null = null;

    /**
     * Initialize signal synchronization and validation
     */
    ngOnInit() {
        this.setupSignalSync();
        this.setupValidation();
    }

    /**
     * Sets up bidirectional sync between FormControl and signals
     */
    protected setupSignalSync() {
        if (this.signalSyncInitialized) return;
        this.signalSyncInitialized = true;

        const ctrl = this.control();

        const updateSignals = () => {
            this.value.set(ctrl.value);
            this.invalid.set(ctrl.invalid);
            this.touched.set(ctrl.touched);
            this.pending.set(ctrl.pending);
            this.disabled.set(ctrl.disabled);
            this.errors.set(ctrl.errors);
            this.required.set(this.hasRequiredValidator());
        };

        // Initial sync
        updateSignals();

        // Subscribe to changes
        const valueSubscription = ctrl.valueChanges.subscribe(() => {
            updateSignals();
        });

        const statusSubscription = ctrl.statusChanges.subscribe(() => {
            updateSignals();
        });

        // Cleanup
        this.destroyRef.onDestroy(() => {
            valueSubscription.unsubscribe();
            statusSubscription.unsubscribe();
        });
    }

    /**
     * Sets up reactive validation based on input signals
     */
    protected setupValidation() {
        if (this.validationInitialized) return;
        this.validationInitialized = true;

        this.validationEffectRef = effect(() => {
            const currentValueType = this.valueType();
            const currentDecimal = this.decimal();
            const currentMin = this.min();
            const currentMax = this.max();
            const currentMinLength = this.minLength();
            const currentMaxLength = this.maxLength();
            const currentPasswordStrength = this.passwordStrength();
            const currentRequired = this.required();

            this.applyValidators({
                valueType: currentValueType,
                decimal: currentDecimal,
                min: currentMin,
                max: currentMax,
                minLength: currentMinLength,
                maxLength: currentMaxLength,
                passwordStrength: currentPasswordStrength,
                required: currentRequired
            });
        });

        this.destroyRef.onDestroy(() => {
            this.validationEffectRef?.destroy();
        });
    }

    /**
     * Applies validators based on configuration
     */
    private applyValidators(config: {
        valueType: string;
        decimal: number;
        min: number;
        max: number;
        minLength: number;
        maxLength: number;
        passwordStrength: boolean;
        required: boolean;
    }) {
        const ctrl = this.control();
        if (!ctrl) return;

        const validators = [];

        if (config.required) {
            validators.push(Validators.required);
        }

        if (config.valueType === 'int' && config.decimal === 0 && config.required) {
            const pattern = /^[1-9][0-9]*$/;
            validators.push(Validators.pattern(pattern));
        }

        if (config.valueType === 'int' && config.decimal > 0) {
            const decimalRegex = new RegExp(
                '^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,' + config.decimal + '})?\\s*$'
            );
            validators.push(Validators.pattern(decimalRegex));
        }

        if (config.min > 0) {
            validators.push(Validators.min(config.min));
        }
        if (config.max > -1) {
            validators.push(Validators.max(config.max));
        }
        if (config.minLength > -1) {
            validators.push(Validators.minLength(config.minLength));
        }
        if (config.maxLength > -1) {
            validators.push(Validators.maxLength(config.maxLength));
        }
        if (config.passwordStrength) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|:;"'<>,.?/~]).{8,}$/;
            validators.push(Validators.pattern(passwordRegex));
        }

        ctrl.setValidators(validators);
        ctrl.updateValueAndValidity({ emitEvent: false });
    }

    errorMessage = computed(() => {
        if (!this.showError()) return '';

        const errors = this.errors();
        if (!errors) return '';

        const firstKey = Object.keys(errors)[0];
        const errorValue = errors[firstKey];

        const template = this.errorMessages[firstKey] || 'Invalid field';

        return this.interpolate(template, errorValue);
    });

    private interpolate(template: string, errorValue: any): string {
        if (!errorValue || typeof errorValue !== 'object') return template;

        return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
            errorValue[key] ?? ''
        );
    }

    // Helper properties
    type = input<string>('text');
    label = input<string>('');
    helpText = input<string>('');
    focused = signal(false);
    sort = input<boolean>(true);
    name = input<string>('');
    autoFocus = input<boolean>(false);
    inputType = signal<string>('text');
    inputMode = signal<string>('');
    tabIndex = input<number>(0);
    upperCase = input<boolean>(false);
    lowerCase = input<boolean>(false);
    noEmoji = input<boolean>(false);
    items = input<any[]>([]);
    key = input<string>('');
    keyName = input<string>('');
    enableSelectSearch = computed(() => {
        return this.items().length > 5;
    });

    // Event Emitters
    onClear = output<any>();
    onBlur = output<any>();
    onFocus = output<any>();
    onEnter = output<any>();
    onTab = output<any>();
    onSearch = output<any>();
    onChange = output<any>();
    onClick = output<any>();
    onSelect = output<any>();

    // View Child
    formInput = viewChild<ElementRef>('formInput');

    // Internal
    private changeTimeOut: any;
    passwordStrengthShow = signal(false);
    valueType = input<string>('text');

    // Validation configurations
    decimal = input<number>(0);
    min = input<number>(-1);
    max = input<number>(-1);
    minLength = input<number>(-1);
    maxLength = input<number>(-1);
    passwordStrength = input<boolean>(false);

    // Internal state
    addOnID = signal('');
    strengthParams = signal<any>({
        eight_characters: false,
        lower_case: false,
        upper_case: false,
        number: false,
        special_characters: false
    });
    strength = signal<number>(0);
    passwordTextType = signal<'password' | 'text'>('password');
    private passwordToggleTimeout: any;

    onAction(type: string) {
        switch (type) {
            case 'clear':
                this.control().setValue(this.valueType() === 'int' ? 0 as any : null);
                this.onClear.emit(this.control().value);
                break;
            case 'blur':
                this.focused.set(false);
                this.onBlur.emit(this.control().value);
                this.passwordStrengthShow.set(false);
                break;
            case 'focus':
                this.focused.set(true);
                this.onFocus.emit(this.control().value);
                this.passwordStrengthShow.set(true);
                break;
            case 'enter':
                this.onEnter.emit(this.control().value);
                break;
            case 'tab':
                this.onTab.emit(this.control().value);
                break;
            case 'search':
                this.onSearch.emit(this.control().value);
                break;
            case 'change':
                this.onChange.emit(this.control().value);
                break;
            case 'select':
                this.onSelect.emit(this.control().value);
                break;
            default:
                this.onClick.emit(null);
                break;
        }
    }

    keyDownEvent(event: any) {
        switch (event.key) {
            case 'Enter':
                this.onAction('enter');
                break;
            case 'Tab':
                this.onAction('tab');
                break;
            default:
                break;
        }
    }

    keyUpEvent(event: any) {
        if (this.changeTimeOut) clearTimeout(this.changeTimeOut);
        this.getPasswordStrength();
        this.changeTimeOut = setTimeout(() => {
            this.onAction('change');
        }, 500);
    }

    generatePNR() {
        const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let addOnID = '';
        for (let i = 0; i < 7; i++) {
            const randomIndex = Math.floor(Math.random() * alphanumeric.length);
            addOnID += alphanumeric.charAt(randomIndex);
        }
        this.addOnID.set(addOnID);
    }

    setInputMode() {
        switch (this.type()) {
            case 'text':
                this.inputType.set('text');
                break;
            case 'password':
                this.inputType.set('password');
                this.inputMode.set('password');
                break;
            case 'email':
                this.inputType.set('email');
                this.inputMode.set('email');
                break;
            case 'number':
                this.inputType.set('number');
                this.inputMode.set('numeric');
                if (this.decimal() > 0) {
                    this.inputMode.set('decimal');
                }
                break;
            default:
                this.inputMode.set('text');
                break;
        }
    }

    getPasswordStrength() {
        const password = this.control().value;
        if (typeof password !== 'string' || !this.passwordStrength()) {
            return;
        }

        const params = {
            eight_characters: false,
            lower_case: false,
            upper_case: false,
            number: false,
            special_characters: false
        };
        let strengthNumber = 0;

        if (password.length > 7) {
            strengthNumber += 1;
            params.eight_characters = true;
        }
        if (password.match(/[a-z]/)) {
            strengthNumber += 1;
            params.lower_case = true;
        }
        if (password.match(/[A-Z]/)) {
            strengthNumber += 1;
            params.upper_case = true;
        }
        if (password.match(/\d/)) {
            strengthNumber += 1;
            params.number = true;
        }
        if (password.match(/[!@#$%^&*()_\-+={}[\]|:;"'<>,.?/~]/)) {
            strengthNumber += 1;
            params.special_characters = true;
        }

        this.strengthParams.set(params);
        this.strength.set((strengthNumber / 5) * 100);
    }

    toggleHide() {
        if (this.passwordToggleTimeout) {
            clearTimeout(this.passwordToggleTimeout);
        }
        const current = this.passwordTextType();
        this.passwordTextType.set(current === 'password' ? 'text' : 'password');

        if (this.passwordTextType() === 'text') {
            this.passwordToggleTimeout = setTimeout(() => {
                this.toggleHide();
            }, 15000);
        }
    }
}