import { Directive, ElementRef, input, inject, OnInit, OnDestroy } from '@angular/core';
import { NgControl } from '@angular/forms';

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
    private ngControl = inject(NgControl, { optional: true, self: true });
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
            // Additional blur validation if needed
        }, { signal });
    }

    ngOnDestroy() {
        this.abortController.abort();
    }

    emptyValidator(e: any) {
        let inputVal = e.target.value;
        if (inputVal.startsWith(' ')) {
            inputVal = inputVal.trimStart();
            this.updateValue(e.target, inputVal);
        }
    }

    private updateValue(target: any, value: string) {
        target.value = value;
        if (this.ngControl && this.ngControl.control) {
            this.ngControl.control.setValue(value);
        }
    }

    caseValidator() {
        const config = this.config();
        if (!config.case) return;

        let val = this.el.nativeElement.value;
        let newVal = val;

        switch (config.case) {
            case 'uppercase':
                newVal = val.toUpperCase();
                break;
            case 'lowercase':
                newVal = val.toLowerCase();
                break;
            case 'capitalize':
                newVal = val.replace(/\b\w/g, (match: any) => match.toUpperCase());
                break;
            default:
                break;
        }

        if (newVal !== val) {
            this.updateValue(this.el.nativeElement, newVal);
        }
    }

    numberValidator(e: any) {
        const config = this.config();
        if (config.type !== 'number') return;

        let inputVal = e.target.value;
        const originalVal = inputVal;

        let regexStr = '^';

        if (config.negative) {
            regexStr += '-?';
        }

        regexStr += '\\d*';

        if (config.decimal && config.decimal > 0) {
            regexStr += `(\\.\\d{0,${config.decimal}})?`;
        }

        regexStr += '$';

        let regex = new RegExp(regexStr);

        if (config.decimal && config.decimal > 0 && inputVal === '.') {
            inputVal = '0.';
        }

        inputVal = inputVal.replace(/[^\d.-]+/g, '');

        if (!regex.test(inputVal)) {
            if (config.negative) {
                inputVal = inputVal.replace(/(?!^)-/g, '');
            } else {
                inputVal = inputVal.replace('-', '');
            }

            if (config.decimal && config.decimal > 0 && inputVal.includes(".")) {
                const [beforeDecimal, afterDecimal = ""] = inputVal.split(".");
                inputVal = beforeDecimal + "." + afterDecimal.substring(0, config.decimal);
            } else {
                inputVal = inputVal.replace(/\./g, '');
            }

            let newInput = parseFloat(inputVal);
            if (isNaN(newInput)) {
                inputVal = "";
            }
        }

        if (config.max && config.max > 0) {
            if (parseFloat(inputVal) > config.max) {
                inputVal = config.max.toString();
            }
        }

        if (inputVal !== originalVal) {
            this.updateValue(e.target, inputVal);
        }
    }

    limitValidator(e: any) {
        const config = this.config();
        if (config.maxLength === -1 || !config.maxLength) return;

        let inputVal = e.target.value;
        if (inputVal.length > config.maxLength) {
            inputVal = inputVal.substring(0, config.maxLength);
            this.updateValue(e.target, inputVal);
        }
    }
}