import { Injectable, Injector, effect, Signal, runInInjectionContext } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { RuleMap, FieldRule } from './types';
import { VisibilityStore } from './visibility.store';

@Injectable({ providedIn: 'root' })
export class RuleEngineService {
    constructor(private visibilityStore: VisibilityStore) { }

    init<T>(
        injector: Injector,
        formGroup: FormGroup,
        formValue: Signal<T>,
        rules: RuleMap<T>
    ) {
        // We must run effects in an injection context if not in a constructor context
        // But this method might be called from a constructor. 
        // To be safe, we can ask for the injector or assume current context.
        // The prompt says "Uses effect() only".

        // We can assume the user calls this in an injection context (like constructor).
        // Or we pass the injector.

        runInInjectionContext(injector, () => {
            effect(() => {
                const val = formValue();

                // Process rules
                // We'll accumulate visibility changes to batch update
                const visibilityUpdates: Record<string, boolean> = {};

                rules.forEach(rule => {
                    const matched = rule.condition(val);

                    if (rule.action === 'visible') {
                        rule.fields.forEach(field => {
                            visibilityUpdates[field] = matched;
                            // If hidden, also disable? Usually yes, helps with validation.
                            // But let's stick to core "visibility" token for now, 
                            // and handle enable/disable separately or as a side effect.
                            // The prompt says: "Applies: Visibility rules, Required validator toggling, Enable / disable state"

                            const control = formGroup.get(field);
                            if (control) {
                                if (matched) {
                                    // If becoming visible, maybe enable?
                                    // User might handle enable/disable via separate rule.
                                    // But typically hidden fields should be disabled to skip validation.
                                    // Let's defer to specific 'enable' rules or explicit reqs.
                                }
                            }
                        });
                    }

                    if (rule.action === 'required') {
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

                    if (rule.action === 'enable') {
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
                });

                // Apply batched visibility
                this.visibilityStore.setVisibility(visibilityUpdates);
            });
        });
    }
}
