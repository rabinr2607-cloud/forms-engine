import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputControlBase } from '../../core/input-control-base';

@Component({
    selector: 'lib-checkbox',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatCheckboxModule, MatFormFieldModule],
    template: `
    <div class="checkbox-wrapper">
      <mat-checkbox [formControl]="control" [required]="required()" color="primary">
        {{ label }}
      </mat-checkbox>
      @if (showError()) {
        <mat-error style="font-size: 0.75rem; margin-left: 1rem;">{{ errorMessage() }}</mat-error>
      }
    </div>
  `,
    styles: [`:host { display: block; margin-bottom: 1rem; } .checkbox-wrapper { display: flex; flex-direction: column; }`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class CheckboxComponent extends InputControlBase<boolean> { }
