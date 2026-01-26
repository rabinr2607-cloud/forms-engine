import { Directive, inject, signal, computed, effect, input, output, viewChild, ElementRef, DestroyRef } from '@angular/core';
import { FormControl, ValidationErrors, Validators } from '@angular/forms';
import { VALIDATION_ERROR_MESSAGES } from './error-map';
import { APP_SETTING } from './app-setting';
import { toSignal } from '@angular/core/rxjs-interop';


@Directive()
export abstract class InputControlBase<T> {

    private destroyRef = inject(DestroyRef);

    control = input<FormControl<T>>(new FormControl() as FormControl<T>);

    // Field-level state
    value = signal<T | null>(null);
    invalid = signal(false);
    touched = signal(false);
    pending = signal(false);
    disabled = signal(false);
    required = signal(false);
    showError = computed(() => this.invalid() && this.touched());

    constructor() {

        // ✅ Use effect to sync with control changes
        effect(() => {

            const ctrl = this.control();

            // Initial sync
            this.syncControlState(ctrl);

            // Subscribe to changes using toSignal pattern
            const valueSignal = toSignal(ctrl.valueChanges, {
                initialValue: ctrl.value
            });

            const statusSignal = toSignal(ctrl.statusChanges, {
                initialValue: ctrl.status
            });

            // Nested effect to react to stream changes
            effect(() => {
                this.value.set(valueSignal());
                this.invalid.set(ctrl.invalid);
                this.touched.set(ctrl.touched);
                this.pending.set(ctrl.pending);
                this.disabled.set(ctrl.disabled);
                this.required.set(this.hasRequiredValidator());
            });

        });
    }

    private syncControlState(ctrl: FormControl<T>) {
        this.value.set(ctrl.value);
        this.invalid.set(ctrl.invalid);
        this.touched.set(ctrl.touched);
        this.pending.set(ctrl.pending);
        this.disabled.set(ctrl.disabled);
        this.required.set(this.hasRequiredValidator());
    }


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
    toolTipEnabled = input<boolean>(false);

    private errorMessages = inject(VALIDATION_ERROR_MESSAGES);
    protected appSetting = inject(APP_SETTING);


    errorMessage = computed(() => {
        if (!this.showError()) return '';
        const errors = this.control().errors;
        if (!errors) return '';

        // Return first error message found
        const firstKey = Object.keys(errors)[0];
        return this.errorMessages[firstKey] || 'Invalid field';
    });

    // Event Emitters (Zoneless outputs)
    onClear = output<any>();
    onBlur = output<any>();
    onFocus = output<any>();
    onEnter = output<any>();
    onTab = output<any>();
    onSearch = output<any>();
    onChange = output<any>();
    onClick = output<any>();
    onSelect = output<any>();


    items = input<any[]>([]);
    key = input<string>('');
    keyName = input<string>('');
    enableSelectSearch = computed(() => {
        return this.items().length > 5;
    })

    // View Child
    formInput = viewChild<ElementRef>('formInput');

    // Internal
    private changeTimeOut: any;
    passwordStrengthShow = signal(false);
    valueType = input<string>('text'); // 'int' or 'string' etc if needed

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

    setValidate() {
        if (!this.control()) return;

        // Note: placeholder logic omitted as it's purely UI driven usually

        const validation = [];

        // We can't easily check for 'required' from inputs if it's not passed as a validator
        // But let's assume if 'required' input is true we add it? 
        // The user snippet used `this.__required`. 
        // We will assume validators are primarily passed via FormControl construction, 
        // but this method allows dynamic validator updates based on inputs.

        // We need to react to inputs. We'll use `effect` for this in constructor or init.

        if (this.required()) {
            validation.push(Validators.required);
        }

        // Email check - usually handled by type='email'
        // User snippet: if (this.__type === 'email') ...
        // We don't have 'type' in base, it's in InputControl. 
        // We should add `type` to base or make it abstract? 
        // For now let's assume `valueType` or check if there's a way.
        // Actually `InputControlBase` is generic `T`.

        if (this.valueType() === 'int' && this.decimal() === 0 && this.required()) {
            const pattern = /^[1-9][0-9]*$/;
            validation.push(Validators.pattern(pattern));
        }

        if (this.valueType() === 'int' && this.decimal() > 0) {
            const newRegex = new RegExp(
                '^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,' + this.decimal() + '})?\\s*$'
            );
            validation.push(Validators.pattern(newRegex));
        }

        if (this.min() > 0) {
            validation.push(Validators.min(this.min()));
        }
        if (this.max() > -1) {
            validation.push(Validators.max(this.max()));
        }
        if (this.minLength() > -1) {
            validation.push(Validators.minLength(this.minLength()));
        }
        if (this.maxLength() > -1) {
            validation.push(Validators.maxLength(this.maxLength()));
        }
        if (this.passwordStrength()) {
            const regex =
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|:;"'<>,.?/~]).{8,}$/;
            validation.push(Validators.pattern(regex));
        }

        // We append these to existing validators? Or replace?
        // User snippet: setValidators(validation) -> replaces all.
        // This acts as a validator factory.

        this.control().setValidators(validation);
        this.control().updateValueAndValidity();
    }

    generatePNR() {
        const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let addOnID = '';
        // const timestamp = Date.now().toString(); // unused in snippet
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
                this.inputMode.set('text'); // default to text instead of undefined string
                break;
        }
    }

    getPasswordStrength() {
        // Logic to calculate password strength
        // We need the value.
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

    syncSignals() {
        const update = () => {
            this.value.set(this.control().value);
            this.invalid.set(this.control().invalid);
            this.touched.set(this.control().touched);
            this.pending.set(this.control().pending);
            this.disabled.set(this.control().disabled);

            const validatorFn = this.control().validator;
            const validator = validatorFn ? validatorFn({} as any) : null;

            this.required.set(this.hasRequiredValidator());
        };

        // Initial
        update();


        this.control().events.subscribe(() => {
            update();
        });

    }

    private hasRequiredValidator(): boolean {
        const validatorFn = this.control().validator;
        if (!validatorFn) return false;
        const validator = validatorFn({} as any);
        return validator && validator['required'];
    }


}
