import { Directive, ElementRef, input, inject, OnInit, OnDestroy } from '@angular/core';

export interface ValidatorConfig {
    type: string;
    case?: string;
    decimal?: number;
    negative?: boolean;
    maxLength?: number;
    max?: number;
}

@Directive({
    selector: '[validator]',
})
export class ValidatorDirective implements OnInit, OnDestroy {

    config = input<ValidatorConfig>({
        type: 'text',
        case: '',
        decimal: 0,
        negative: false,
        maxLength: -1,
        max: -1
    }, { alias: 'validator' });

    private el = inject(ElementRef);
    private abortController = new AbortController();

    ngOnInit() {
        const nativeEl = this.el.nativeElement;
        const signal = this.abortController.signal;

        nativeEl.addEventListener('input', (event: any) => {
            this.emptyValidator(event);
            this.caseValidator();
            this.numberValidator(event);
            this.limitValidator(event);
        }, { signal });

        nativeEl.addEventListener('blur', (event: any) => {
            // this.numberValidator(event);
        }, { signal });
    }

    ngOnDestroy() {
        this.abortController.abort();
    }

    emptyValidator(e: any) {
        let inputVal = e.target.value;
        inputVal.length === 1 && inputVal === ' '
            ? (inputVal = "")
            : "";
        e.target.value = inputVal;
    }

    caseValidator() {
        const config = this.config();
        switch (config.case) {
            case 'uppercase':
                this.el.nativeElement.value = this.el.nativeElement.value.toUpperCase();
                break;
            case 'lowercase':
                this.el.nativeElement.value = this.el.nativeElement.value.toLowerCase();
                break;
            case 'capitalize':
                this.el.nativeElement.value = this.el.nativeElement.value.replace(/\b\w/g, (match: any) => match.toUpperCase());
                break;
            default:
                break;
        }
    }

    numberValidator(e: any) {
        const config = this.config();
        // Exit early if the validator type is not 'number'
        if (config.type !== 'number') return;

        // Get the input value from the event
        let inputVal = e.target.value;

        // Construct the regex pattern based on validator settings
        let regexStr = '^';

        // Allow optional negative sign if specified
        if (config.negative) {
            regexStr += '-?';
        }

        // Allow any number of digits before a decimal point
        regexStr += '\\d*';

        // If decimals are allowed, add decimal part to regex
        if (config.decimal && config.decimal > 0) {
            regexStr += `(\\.\\d{0,${config.decimal}})?`; // Make decimal part optional
        }

        // End of the regex pattern
        regexStr += '$';

        // Create a RegExp object from the constructed string
        let regex = new RegExp(regexStr);

        // Handle case where input is just a decimal point
        if (config.decimal && config.decimal > 0 && inputVal === '.') {
            inputVal = '0.'; // Convert lone '.' to '0.'
        }
        // Remove invalid characters (non-digit, non-decimal, non-negative)
        inputVal = inputVal.replace(/[^\d.-]+/g, '');

        // Validate input against the constructed regex
        if (!regex.test(inputVal)) {
            // Handle negative sign based on validator settings
            if (config.negative) {
                inputVal = inputVal.replace(/(?!^)-/g, ''); // Allow only one leading negative sign
            } else {
                inputVal = inputVal.replace('-', ''); // Remove all negative signs if not allowed
            }
            // If decimals are allowed, limit the number of decimal places
            if (config.decimal && config.decimal > 0 && inputVal.includes(".")) {
                const [beforeDecimal, afterDecimal = ""] = inputVal.split(".");
                inputVal = beforeDecimal + "." + afterDecimal.substring(0, config.decimal);

            } else {
                // Remove any extra decimal points if decimals are not allowed or not needed
                inputVal = inputVal.replace(/\./g, '');
            }
            // Convert cleaned input to a float and update the target value if valid
            let newInput = parseFloat(inputVal);
            if (isNaN(newInput)) {
                inputVal = ""; // Update the target value with valid number as string
            }
        }

        if (config.max && config.max > 0) {
            if (parseFloat(inputVal) > config.max) {
                inputVal = config.max.toString();
            }
        }
        e.target.value = inputVal;
    }

    limitValidator(e: any) {
        const config = this.config();
        if (config.maxLength === -1 || !config.maxLength) return;
        // Get the input value from the event
        let inputVal = e.target.value;
        inputVal.length > config.maxLength
            ? (inputVal = inputVal.substring(0, config.maxLength))
            : "";
        e.target.value = inputVal;
    }
}
