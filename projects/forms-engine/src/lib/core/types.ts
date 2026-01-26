export type RuleAction = 'visible' | 'required' | 'enable';

export type RuleFn<T> = (value: T) => boolean;

export interface FieldRule<T> {
    action: RuleAction;
    condition: RuleFn<T>;
    fields: string[];
}

export type RuleMap<T> = FieldRule<T>[];
