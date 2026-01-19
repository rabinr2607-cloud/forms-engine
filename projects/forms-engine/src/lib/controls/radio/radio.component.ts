import { Component, ChangeDetectionStrategy, ViewEncapsulation, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field'; // For error display consistency if needed
import { InputControlBase } from '../../core/input-control-base';

@Component({
    selector: 'lib-radio',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatRadioModule, MatFormFieldModule],
    template: `
    <div class="radio-group-container">
      <label class="radio-label" [class.error]="showError()">{{ label }} <span *ngIf="required()">*</span></label>
      <mat-radio-group [formControl]="control" [required]="required()" [disabled]="disabled()" color="primary">
        @for (opt of options; track opt.value) {
          <mat-radio-button [value]="opt.value">{{ opt.label }}</mat-radio-button>
        }
      </mat-radio-group>
      @if (showError()) {
         <mat-error style="font-size: 0.75rem; margin-top: 4px;">{{ errorMessage() }}</mat-error>
      }
    </div>
  `,
    styles: [`
    :host { display: block; margin-bottom: 1rem; }
    .radio-group-container { display: flex; flex-direction: column; gap: 8px; }
    .radio-label { font-size: 1rem; font-weight: 500; color: rgba(0,0,0,0.6); }
    .radio-label.error { color: #f44336; }
    mat-radio-button { margin-right: 16px; }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class RadioComponent extends InputControlBase<any> {
    @Input() options: { label: string; value: any }[] = [];
}
