import { Component, ChangeDetectionStrategy, ViewEncapsulation, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { InputControlBase } from '../../core/input-control-base';

@Component({
    selector: 'lib-dynamic-control',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCheckboxModule,
        MatRadioModule,
        MatIconModule
    ],
    providers: [provideNativeDateAdapter()],
    template: `
    <div class="itg-form itg-form-group" [ngClass]="className + '-group'">
        <!-- Label Container -->
        @if (label()) {
        <div class="label-container">
            <label class="control-label">
                {{ label() }}
                @if (required()) { <span class="required-mark">*</span> }
            </label>
        </div>
        }

        <!-- Input Group -->
        <div class="itg-input-group" [class.has-error]="showError()">
            
            @switch (type()) {
                @case ('select') {
                    <mat-form-field appearance="outline" class="full-width">
                        <mat-label *ngIf="!label()">{{ placeholder || 'Select' }}</mat-label> <!-- Show placeholder as label if no outer label -->
                        <mat-select [formControl]="control" [placeholder]="placeholder || 'Select'">
                            @for (item of items; track item.value) {
                                <mat-option [value]="item.value">{{ item.label }}</mat-option>
                            }
                        </mat-select>
                        <mat-error *ngIf="errorMessage()">{{ errorMessage() }}</mat-error>
                    </mat-form-field>
                }

                @case ('date') {
                    <mat-form-field appearance="outline" class="full-width">
                         <mat-label *ngIf="!label()">{{ placeholder || 'Choose a date' }}</mat-label>
                        <input matInput [matDatepicker]="picker" [formControl]="control" [placeholder]="placeholder || 'Choose a date'">
                        <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                        <mat-datepicker #picker></mat-datepicker>
                        <mat-error *ngIf="errorMessage()">{{ errorMessage() }}</mat-error>
                    </mat-form-field>
                }

                @case ('radio') {
                    <div class="radio-group-container">
                        <mat-radio-group [formControl]="control" [class.vertical-radio]="radioOrientation === 'vertical'">
                            @for (item of items; track item.value) {
                                <mat-radio-button [value]="item.value">{{ item.label }}</mat-radio-button>
                            }
                        </mat-radio-group>
                        @if (showError()) {
                            <div class="error-text">{{ errorMessage() }}</div>
                        }
                    </div>
                }

                @case ('checkbox') {
                   <div class="checkbox-container">
                        <mat-checkbox [formControl]="control">{{ label() }}</mat-checkbox>
                         @if (showError()) {
                            <div class="error-text">{{ errorMessage() }}</div>
                        }
                   </div>
                }
                
                @case ('textarea') {
                    <mat-form-field appearance="outline" class="full-width">
                         <mat-label *ngIf="!label()">{{ placeholder || 'Enter text' }}</mat-label>
                        <textarea matInput [formControl]="control" [placeholder]="placeholder || 'Enter text'" [rows]="rows"></textarea>
                         <mat-hint align="end">{{ control.value?.length || 0 }} / {{ maxLength || 500 }}</mat-hint>
                        <mat-error *ngIf="errorMessage()">{{ errorMessage() }}</mat-error>
                    </mat-form-field>
                }

                @case ('time') {
                     <mat-form-field appearance="outline" class="full-width">
                        <mat-label *ngIf="!label">{{ placeholder || 'Select time' }}</mat-label>
                        <input matInput type="time" [formControl]="control" [placeholder]="placeholder || 'Select time'">
                        <mat-icon matSuffix>schedule</mat-icon>
                        <mat-error *ngIf="errorMessage()">{{ errorMessage() }}</mat-error>
                     </mat-form-field>
                }

                @default {
                    <!-- Default Text Input -->
                    <mat-form-field appearance="outline" class="full-width">
                        <mat-label *ngIf="!label">{{ placeholder || 'Enter value' }}</mat-label>
                        <input matInput [type]="type()" [formControl]="control" [placeholder]="placeholder || ''">
                        
                         <!-- Suffixes (Clear, Search, Eye) - Simplified implementation -->
                        @if (control.value && !control.disabled) {
                             <button mat-icon-button matSuffix (click)="control.reset()" tabindex="-1">
                                <mat-icon>close</mat-icon>
                            </button>
                        }

                        <mat-error *ngIf="errorMessage()">{{ errorMessage() }}</mat-error>
                    </mat-form-field>
                }
            }
        </div>
    </div>
  `,
    styles: [`
    :host {
        display: block;
        width: 100%;
    }
    
    .itg-form-group {
        margin-bottom: 1rem;
    }

    .label-container {
        margin-bottom: 0.5rem;
    }

    .control-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #374151;
    }

    .required-mark {
        color: #ef4444;
    }

    .full-width {
        width: 100%;
    }

    .error-text {
        color: #f44336;
        font-size: 75%;
        margin-top: 4px;
    }

    /* Radio Group Styling */
    .radio-group-container {
        padding: 8px 0;
    }
    
    mat-radio-group {
        display: flex;
        gap: 16px;
    }

    .vertical-radio {
        flex-direction: column;
        gap: 8px;
    }

    /* Adjusting MatFormField default spacing to fit tight layouts if needed */
    /* ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        height: auto;
    } */
  `],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DynamicControlComponent extends InputControlBase<any> {
    // @Input() type: string = 'text';
    @Input() items: any[] = []; // For select, radio
    @Input() placeholder: string = '';
    @Input() className: string = '';
    @Input() radioOrientation: 'horizontal' | 'vertical' = 'horizontal';
    @Input() rows: number = 3; // For textarea

    // TODO: Implement other specific inputs from the original snippet as needed
    // e.g., keyName, sort, etc.
}
