import {
  ChangeDetectionStrategy, Component, input, output,
  CUSTOM_ELEMENTS_SCHEMA, viewChild, OnInit, OnDestroy,
  effect, signal, computed, EffectRef
} from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { addDays, addMonths, addYears, format, isValid, subDays } from 'date-fns';
import { Subscription } from 'rxjs';
import { InputControlBase } from '@zilqora/forms-engine';
import { FilterAndSortPipe } from '../../core/pipes';
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

  private _tempMinDate = signal<Date | null>(null);
  private _minDate = signal<Date | null>(null);
  private _maxDate = signal<Date | null>(null);
  private _addMaxYear = signal<number>(0);
  private _addMaxMonth = signal<number>(0);

  minDate = computed(() => this._minDate());
  maxDate = computed(() => this._maxDate());

  private valueSubscriber: Subscription | null = null;
  private searchSubscriber: Subscription | null = null;
  private minDateEffectRef: EffectRef | null = null;
  private maxDateEffectRef: EffectRef | null = null;

  /**
   * Initialize component - Call parent first, then child logic
   */
  override ngOnInit(): void {
    super.ngOnInit();

    this.setupSearchControl();
    this.setupDateHandling();
    this.setupDateInputEffects();
  }

  /**
   * Setup search control for select dropdowns
   */
  private setupSearchControl() {
    this.searchSubscriber = this.searchControl.valueChanges.subscribe(val => {
      this.selectSearchInput.set(val || '');
    });
  }

  /**
   * Setup date-specific value handling
   */
  private setupDateHandling() {
    if (this.type() !== 'date') {
      return;
    }

    this.valueSubscriber = this.control().valueChanges.subscribe(async (val: any) => {
      await this.handleDateChange(val);
    });

    const initialValue = this.control().value;
    if (initialValue) {
      this.handleDateChange(initialValue);
    }
  }

  /**
   * Handles date value changes from FormControl
   */
  async handleDateChange(val: any): Promise<void> {
    // Null or empty
    if (val === null || val === undefined || val === '') {
      this.value.set(null);
      this.clearInputField();
      return;
    }

    // SQL Server default date
    if (val === '0001-01-01T00:00:00') {
      this.value.set(null);
      this.control().setValue(null, { emitEvent: false });
      this.clearInputField();
      return;
    }

    // String date
    if (typeof val === 'string') {
      const parsedDate = await this.parseStringDate(val);

      if (parsedDate) {
        this.value.set(parsedDate);
        this.control().setValue(parsedDate, { emitEvent: false });
      } else {
        console.warn(`Invalid date string: ${val}`);
        this.value.set(null);
        this.clearInputField();
      }
      return;
    }

    // Date object
    if (val instanceof Date) {
      if (isValid(val)) {
        this.value.set(val);
      } else {
        console.warn('Invalid Date object received');
        this.value.set(null);
        this.clearInputField();
      }
      return;
    }

    console.warn(`Unexpected date value type: ${typeof val}`, val);
    this.value.set(null);
  }

  /**
   * Parse string dates with UTC handling
   */
  private async parseStringDate(dateStr: string): Promise<Date | null> {
    if (!dateStr || dateStr.trim() === '') {
      return null;
    }

    try {
      let normalizedStr = dateStr.toString();

      if (!this.dateOnly() &&
        !normalizedStr.endsWith('Z') &&
        !normalizedStr.match(/[+-]\d{2}:\d{2}$/)) {
        normalizedStr = normalizedStr + 'Z';
      }

      const parsedDate = new Date(normalizedStr);

      if (!isValid(parsedDate)) {
        return null;
      }

      return parsedDate;
    } catch (error) {
      console.error('Error parsing date string:', error);
      return null;
    }
  }

  /**
   * Clear native input field
   */
  private clearInputField() {
    const inputEl = this.formInput()?.nativeElement;
    if (inputEl) {
      inputEl.value = '';
    }
  }

  /**
   * Setup reactive effects for min/max date inputs
   */
  private setupDateInputEffects() {
    this.minDateEffectRef = effect(() => {
      const minDateValue = this.minDateInput();
      this.handleMinDateChange(minDateValue);
    });

    this.maxDateEffectRef = effect(() => {
      const maxDateValue = this.maxDateInput();
      this.handleMaxDateChange(maxDateValue);
    });
  }

  /**
   * Handle minDate input changes
   */
  private async handleMinDateChange(minDateValue: string | null) {
    if (!minDateValue) {
      this._minDate.set(null);
      this._tempMinDate.set(null);
      return;
    }

    const parsedDate = await this.parseStringDate(minDateValue);

    if (!parsedDate) {
      console.warn(`Invalid minDate value: ${minDateValue}`);
      return;
    }

    this._tempMinDate.set(parsedDate);

    if (this.isFuture()) {
      this._minDate.set(addDays(parsedDate, 1));
    } else {
      this._minDate.set(parsedDate);
    }

    if (this._addMaxYear() > 0) {
      this.setAddMaxYear();
    }

    if (this._addMaxMonth() > 0) {
      this.setAddMaxMonth();
    }
  }

  /**
   * Handle maxDate input changes
   */
  private async handleMaxDateChange(maxDateValue: string | null) {
    if (!maxDateValue) {
      this._maxDate.set(null);
      return;
    }

    const parsedDate = await this.parseStringDate(maxDateValue);

    if (!parsedDate) {
      console.warn(`Invalid maxDate value: ${maxDateValue}`);
      return;
    }

    this._maxDate.set(parsedDate);
  }


  ngOnDestroy(): void {
    this.valueSubscriber?.unsubscribe();
    this.searchSubscriber?.unsubscribe();
    this.minDateEffectRef?.destroy();
    this.maxDateEffectRef?.destroy();
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
      // Can reset search here if needed
    }
  }

  /**
   * Handle date changes from datepicker
   */
  onDateChange(event: any) {
    const selectedDate = event.value;

    if (!selectedDate) {
      this.value.set(null);
      this.control().setValue(null);
      this.onAction('change');
      return;
    }

    let formattedValue: string;

    if (this.dateOnly()) {
      formattedValue = format(selectedDate, this.appSetting.environment.serverDateFormat);
    } else {
      if (this.dayTo()) {
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 0);
        formattedValue = endOfDay.toISOString();
      } else {
        formattedValue = selectedDate.toISOString();
      }
    }

    this.value.set(formattedValue);
    this.control().setValue(formattedValue);
    this.onAction('change');
  }

  setAddMaxMonth(value?: number) {
    const tempDate = this._tempMinDate();
    if (!tempDate) return;

    const nextSixMonthDate = addMonths(tempDate, this._addMaxMonth());
    const minDate = addDays(nextSixMonthDate, 1);
    this._minDate.set(minDate);
  }

  setAddMaxYear(value?: number) {
    const tempDate = this._tempMinDate();
    if (!tempDate) return;

    const nextThreeYearDate = addYears(tempDate, this._addMaxYear());
    const maxDate = subDays(nextThreeYearDate, 1);
    this._maxDate.set(maxDate);
  }
}