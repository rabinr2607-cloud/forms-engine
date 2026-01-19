import { Component, Injector, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  RuleEngineService,
  VisibilityStore,
  CheckboxComponent,
  RadioComponent,
  RuleMap,
  InputControl
} from 'forms-engine';

@Component({
  selector: 'app-insurance-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CheckboxComponent,
    RadioComponent,
    InputControl
  ],
  template: `
    <div class="form-container">
      <h1>Insurance Cover Form</h1>
      
      <form [formGroup]="form">
        <!-- Main Grid -->
        <div class="grid-layout">
          <!-- Cover Name -->
          <xy-input-control 
            label="Cover Name" 
            [control]="controls.coverName">
          </xy-input-control>

          <!-- Cover Type -->
           <xy-input-control 
            label="Cover Type" 
            [control]="controls.coverTypeValue"
            type="select">
          </xy-input-control>

          <!-- Effective Date -->
          <xy-input-control
          type="date"
            label="Effective Date" 
            [control]="controls.effectiveDate">
          </xy-input-control>

          <!-- Is Fixed Premium -->
          <lib-radio
            label="Is Fixed Premium?"
            [control]="controls.isFixedPremium"
            [options]="yesNoOptions">
          </lib-radio>

          <!-- Dynamic Fields: Variable Premium
          @if (v.visible('minInsuredAmount')()) {
            <lib-input label="Min Insured Amount" [control]="controls.minInsuredAmount" type="number"></lib-input>
          }
          @if (v.visible('maxInsuredAmount')()) {
            <lib-input label="Max Insured Amount" [control]="controls.maxInsuredAmount" type="number"></lib-input>
          }
          @if (v.visible('minPremiumAmount')()) {
            <lib-input label="Min Premium Amount" [control]="controls.minPremiumAmount" type="number"></lib-input>
          }
          @if (v.visible('maxPremiumAmount')()) {
            <lib-input label="Max Premium Amount" [control]="controls.maxPremiumAmount" type="number"></lib-input>
          } -->

          <!-- Dynamic Fields: Fixed Premium -->
          <!-- @if (v.visible('fixedAmount')()) {
            <lib-input label="Fixed Amount" [control]="controls.fixedAmount" type="number"></lib-input>
          }
          @if (v.visible('fixedPremium')()) {
            <lib-input label="Fixed Premium" [control]="controls.fixedPremium" type="number"></lib-input>
          } -->

           <!-- Other Fields -->
           <!-- <lib-input label="Min Age Limit" [control]="controls.minAgeLimit" type="number"></lib-input>
           <lib-input label="Max Age Limit" [control]="controls.maxAgeLimit" type="number"></lib-input> -->
           
           <lib-checkbox label="Is Addon Cover" [control]="controls.isAddonCover"></lib-checkbox>
           
           <!-- <lib-input label="Additional Bonus %" [control]="controls.additionalBonusPercentage" type="number"></lib-input>
           <lib-input label="Penalty %" [control]="controls.penaltyPercentage" type="number"></lib-input>
           <lib-input label="Grace Period (Days)" [control]="controls.gracePeriodInDays" type="number"></lib-input>
           <lib-input label="Cover Period (Months)" [control]="controls.coverPeriodInMonths" type="number"></lib-input>
           <lib-input label="Cover Period (Months)" [control]="controls.coverPeriodInMonths" type="number"></lib-input> -->
        </div>

        <div class="actions">
           <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="submit()">Submit</button>
           <pre>{{ form.value | json }}</pre>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container { max-width: 800px; margin: 2rem auto; padding: 2rem; background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .grid-layout { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
    h1 { margin-bottom: 2rem; }
    .actions { margin-top: 2rem; }
  `]
})
export class InsuranceFormComponent {
  private injector = inject(Injector);
  private ruleEngine = inject(RuleEngineService);
  public v = inject(VisibilityStore); // public for template access

  coverTypes = [
    { label: 'Basic', value: 'BASIC' },
    { label: 'Premium', value: 'PREMIUM' },
    { label: 'Gold', value: 'GOLD' }
  ];

  yesNoOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];

  form = new FormGroup({
    coverName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    coverTypeValue: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    isFixedPremium: new FormControl<boolean>(false, { nonNullable: true, validators: [Validators.required] }),
    effectiveDate: new FormControl<Date | null>(null, { validators: [Validators.required] }),

    // Dynamic fields
    minInsuredAmount: new FormControl<number | null>(null),
    maxInsuredAmount: new FormControl<number | null>(null),
    minPremiumAmount: new FormControl<number | null>(null),
    maxPremiumAmount: new FormControl<number | null>(null),

    fixedAmount: new FormControl<number | null>(null),
    fixedPremium: new FormControl<number | null>(null),

    // Others
    minAgeLimit: new FormControl<number | null>(null),
    maxAgeLimit: new FormControl<number | null>(null),
    isAddonCover: new FormControl<boolean>(false, { nonNullable: true }),
    additionalBonusPercentage: new FormControl<number | null>(null),
    penaltyPercentage: new FormControl<number | null>(null),
    gracePeriodInDays: new FormControl<number | null>(null),
    coverPeriodInMonths: new FormControl<number | null>(null)
  });

  // Type safe controls getter
  get controls() {
    return this.form.controls as any; // Cast for simplicity in template
  }

  // Signal for form value
  formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  constructor() {
    this.setupRules();
  }

  setupRules() {
    const rules: RuleMap<any> = [
      // If isFixedPremium === false -> Show variable fields
      {
        action: 'visible',
        fields: ['minInsuredAmount', 'maxInsuredAmount', 'minPremiumAmount', 'maxPremiumAmount'],
        condition: (val) => val.isFixedPremium === false
      },
      {
        action: 'required',
        fields: ['minInsuredAmount', 'maxInsuredAmount', 'minPremiumAmount', 'maxPremiumAmount'],
        condition: (val) => val.isFixedPremium === false
      },

      // If isFixedPremium === true -> Show fixed fields
      {
        action: 'visible',
        fields: ['fixedAmount', 'fixedPremium'],
        condition: (val) => val.isFixedPremium === true
      },
      {
        action: 'required',
        fields: ['fixedAmount', 'fixedPremium'],
        condition: (val) => val.isFixedPremium === true
      }
    ];

    this.ruleEngine.init(this.injector, this.form, this.formValue, rules);
  }

  submit() {
    if (this.form.valid) {
      console.log('Form Submitted', this.form.value);
      alert('Form Valid & Submitted!');
    } else {
      this.form.markAllAsTouched();
    }
  }
}
