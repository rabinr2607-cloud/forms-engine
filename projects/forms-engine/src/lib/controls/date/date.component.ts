import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { InputControlBase } from '../../core/input-control-base';

@Component({
  selector: 'lib-date',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="input-container" [class.has-error]="showError()" [class.disabled]="disabled()">
      <label [for]="controlId" class="input-label">
        {{ label }}
        @if (required()) { <span class="required-mark">*</span> }
      </label>
      
      <input 
        [id]="controlId"
        type="date"
        [formControl]="control" 
        class="native-input"
        [class.error-border]="showError()"
      >

      @if (showError()) {
        <div class="error-text">{{ errorMessage() }}</div>
      }
      @if (pending()) {
        <div class="hint-text">Validating...</div>
      }
    </div>
  `,
  styles: [`
    .input-container {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      margin-bottom: 1rem;
      width: 100%;
      font-family: inherit;
    }

    .input-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .required-mark {
      color: #ef4444;
    }

    .native-input {
      width: 100%;
      padding: 0.625rem 0.75rem;
      font-size: 1rem;
      line-height: 1.5;
      color: #1f2937;
      background-color: #fff;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
      box-sizing: border-box;
      font-family: inherit;
    }

    .native-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }

    .native-input:disabled {
      background-color: #f3f4f6;
      cursor: not-allowed;
      color: #9ca3af;
    }

    /* Error State */
    .has-error .native-input {
      border-color: #ef4444;
    }
    
    .has-error .native-input:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
    }

    .has-error .input-label {
      color: #ef4444;
    }

    .error-text {
      font-size: 0.75rem;
      color: #ef4444;
      margin-top: 0.1rem;
    }

    .hint-text {
      font-size: 0.75rem;
      color: #6b7280;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DateComponent extends InputControlBase<Date | null> {
  controlId = 'date-' + Math.random().toString(36).substr(2, 9);
}
