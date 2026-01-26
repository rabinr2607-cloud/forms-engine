import { ChangeDetectionStrategy, Component, input, output, CUSTOM_ELEMENTS_SCHEMA, viewChild, OnInit, OnDestroy, effect } from '@angular/core';
import { InputControlBase } from '../../core/input-control-base';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { computed, signal } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { addDays, addMonths, addYears, format, isValid, subDays } from 'date-fns';
import { FilterAndSortPipe } from "../../core/pipes";
import { ValidatorDirective } from '../../core/validator.directive';

@Component({
  selector: 'zx-input-control',
  imports: [
    ReactiveFormsModule,
    NgTemplateOutlet,
    MatTooltip,
    NgClass,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    FilterAndSortPipe,
    ValidatorDirective,
    MatTooltipModule
  ],
  providers: [provideNativeDateAdapter()],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './input-control.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputControl extends InputControlBase<any> implements OnInit, OnDestroy {

  options = input<{ label: string; value: any }[]>([]);
  removeBg = input<boolean>(false);
  designType = input<'static' | 'dynamic'>('static');

  placeholder = input<string>('');
  className = input<string>('');
  radioOrientation = input<'horizontal' | 'vertical'>('horizontal');
  picker = viewChild<MatDatepicker<Date>>('picker');

  dateOnly = input<boolean>(false);
  dayTo = input<boolean>(false);
  search = input<boolean>(false);
  multiple = input<boolean>(false);
  isFuture = input<boolean>(false);


  defaultOption = input<boolean>(false);

  searchControl = new FormControl('');
  selectSearchInput = signal<any>('');

  validatorConfig = computed(() => ({
    type: this.type(),
    case: this.upperCase() ? 'uppercase' : (this.lowerCase() ? 'lowercase' : ''),
    decimal: this.decimal(),
    negative: false,
    maxLength: this.maxLength(),
    max: this.max()
  }));

  minDateInput = input<string | null>(null, { alias: 'minDate' });
  maxDateInput = input<string | null>(null, { alias: 'maxDate' });

  private _tempMinDate = signal<any>('');
  private _minDate = signal<any>('');
  private _maxDate = signal<any>('');
  private _addMaxYear = signal<number>(0);
  private _addMaxMonth = signal<number>(0);

  // Public computed signals
  minDate = computed(() => this._minDate());
  maxDate = computed(() => this._maxDate());

  // constructor() {
  //   super();

  //   effect(() => {
  //     const minDateValue = this.minDateInput();

  //     if (minDateValue) {
  //       const result: any = this.getParsedDate(minDateValue);

  //       if (result) {
  //         this._tempMinDate.set(result);

  //         if (!this.isFuture()) {
  //           this._minDate.set(result);
  //         } else {
  //           this._minDate.set(addDays(result, 1));
  //         }

  //         if (this._addMaxYear() > 0) {
  //           this.setAddMaxYear();
  //         }

  //         if (this._addMaxMonth() > 0) {
  //           this.setAddMaxMonth();
  //         }
  //       }
  //     } else {
  //       this._minDate.set('');
  //     }
  //   });

  //   // Effect to handle maxDate input changes
  //   effect(() => {
  //     const maxDateValue = this.maxDateInput();

  //     if (maxDateValue) {
  //       this.getParsedDate(maxDateValue).then((result: any) => {
  //         if (result) {
  //           this._maxDate.set(result);
  //         } else {
  //           this._maxDate.set('');
  //         }
  //       });
  //     } else {
  //       this._maxDate.set('');
  //     }
  //   });

  // }

  private valueSubscriber: any;

  ngOnInit(): void {
    this.syncSignals();
    this.searchControl.valueChanges.subscribe(val => {
      this.selectSearchInput.set(val || '');
    });

    if (this.type() === 'date') {
      this.valueSubscriber = this.control().valueChanges.subscribe(async (val: any) => {
        this.handleDateChange(val);
      });
      this.handleDateChange(this.control().value);
    }
  }

  ngOnDestroy(): void {
    if (this.valueSubscriber) {
      this.valueSubscriber.unsubscribe();
    }
  }

  async handleDateChange(val: any) {
    // if (val && typeof val === 'string') {
    //   if (val === '0001-01-01T00:00:00') {
    //     this.control().setValue(null, { emitEvent: false });
    //     this.__xvalue.set(null);
    //     return;
    //   }
    //   let dateVal = val.toString();

    //   if (!this.dateOnly() && !dateVal.endsWith('Z')) {
    //     dateVal = dateVal + 'Z';
    //   }

    //   const parsedDate = new Date(dateVal);
    //   if (isValid(parsedDate)) {
    //     this.__xvalue.set(parsedDate);
    //     this.control().setValue(parsedDate, { emitEvent: false });
    //   }
    // } else {
    //   this.__xvalue.set(val);
    // }
  }

  onInput(event: any) {
    if (this.type() === 'number') {
      const inputVal = event.target.value;
      const parsedVal = parseFloat(inputVal);

      if (isNaN(parsedVal)) {
        this.control().setValue(null);
      } else {
        if (this.valueType() === 'string') {
          this.control().setValue(parsedVal.toString());
        } else {
          this.control().setValue(parsedVal);
        }
      }
    }
  }

  onLocalClear() {
    this.control().setValue(this.valueType() === 'int' ? 0 : null);
    this.onAction('clear');
  }

  isSelectOpened(opened: boolean) {
    if (!opened) {
      // Reset search on close if needed
      // this.selectSearchInput.set('');
    }
  }

  onDateChange(event: any) {
    let xValue = event.value;

    if (!xValue) {
      this.value.set(null);
      this.onAction('change');
      return;
    }

    if (!this.dateOnly()) {
      if (this.dayTo()) {
        const endOfDay = new Date(xValue);
        endOfDay.setHours(23, 59, 59, 0);
        this.value.set(endOfDay.toISOString());
      } else {
        this.value.set(xValue.toISOString());
      }
    } else {
      this.value.set(format(xValue, this.appSetting.environment.serverDateFormat));
    }
    this.control().setValue(this.value());
    this.onAction('change');
  }


  // this is for date picker Methods 

  // Helper methods to update add max year/month
  setAddMaxMonth(value?: number) {
    const nextSixMonthDate = addMonths(this._tempMinDate(), this._addMaxMonth());
    const minDate = subDays(nextSixMonthDate, -1);
    this._minDate.set(minDate);
  }

  setAddMaxYear(value?: number) {
    const nextThreeYearDate = addYears(this._tempMinDate(), this._addMaxYear());
    const maxDate = subDays(nextThreeYearDate, 1);
    this._maxDate.set(maxDate);
  }

  async getParsedDate(date: string): Promise<any> {
    if (!date) return null;

    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

}
