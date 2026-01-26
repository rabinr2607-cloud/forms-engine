
import { Injectable, Injector, effect, Signal, runInInjectionContext, DestroyRef, inject } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { VisibilityStore } from './visibility.store';
import { RuleMap, FieldRule } from './types';

@Injectable({ providedIn: 'root' })
export class RuleEngineService {
    constructor(private visibilityStore: VisibilityStore) { }

    /**
     * Initialize rule engine with proper cleanup
     */
    init<T>(
        injector: Injector,
        formGroup: FormGroup,
        formValue: Signal<T>,
        rules: RuleMap<T>
    ): () => void {
        let effectRef: any;

        runInInjectionContext(injector, () => {
            const destroyRef = inject(DestroyRef);

            effectRef = effect(() => {
                const val = formValue();
                this.processRules(val, rules, formGroup);
            });

            // Auto cleanup when injector is destroyed
            destroyRef.onDestroy(() => {
                effectRef?.destroy();
            });
        });

        // Return manual cleanup function
        return () => effectRef?.destroy();
    }

    /**
     * Process all rules for current form value
     */
    private processRules<T>(
        value: T,
        rules: RuleMap<T>,
        formGroup: FormGroup
    ) {
        const visibilityUpdates: Record<string, boolean> = {};

        rules.forEach(rule => {
            const matched = rule.condition(value);

            switch (rule.action) {
                case 'visible':
                    this.applyVisibilityRule(rule, matched, visibilityUpdates, formGroup);
                    break;
                case 'required':
                    this.applyRequiredRule(rule, matched, formGroup);
                    break;
                case 'enable':
                    this.applyEnableRule(rule, matched, formGroup);
                    break;
            }
        });

        // Batch update visibility
        if (Object.keys(visibilityUpdates).length > 0) {
            this.visibilityStore.setVisibility(visibilityUpdates);
        }
    }

    private applyVisibilityRule(
        rule: FieldRule<any>,
        matched: boolean,
        updates: Record<string, boolean>,
        formGroup: FormGroup
    ) {
        rule.fields.forEach(field => {
            updates[field] = matched;

            // Disable hidden fields to prevent validation
            const control = formGroup.get(field);
            if (control) {
                if (!matched) {
                    control.disable({ emitEvent: false });
                } else {
                    control.enable({ emitEvent: false });
                }
            }
        });
    }

    private applyRequiredRule(
        rule: FieldRule<any>,
        matched: boolean,
        formGroup: FormGroup
    ) {
        rule.fields.forEach(field => {
            const control = formGroup.get(field);
            if (control) {
                if (matched) {
                    control.addValidators(Validators.required);
                } else {
                    control.removeValidators(Validators.required);
                }
                control.updateValueAndValidity({ emitEvent: false });
            }
        });
    }

    private applyEnableRule(
        rule: FieldRule<any>,
        matched: boolean,
        formGroup: FormGroup
    ) {
        rule.fields.forEach(field => {
            const control = formGroup.get(field);
            if (control) {
                if (matched) {
                    control.enable({ emitEvent: false });
                } else {
                    control.disable({ emitEvent: false });
                }
            }
        });
    }
}