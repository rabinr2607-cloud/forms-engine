import { ChangeDetectionStrategy, Component, input, output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { InputControlBase } from '../../core/input-control-base';
import { ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { NoEmojiDirective, UpperCaseDirective, LowerCaseDirective, LimitDirective, CharacterOnlyDirective } from '../../core/directives';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { computed, signal } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'zx-input-control',
  imports: [
    ReactiveFormsModule,
    NgTemplateOutlet,
    MatTooltip,
    NgClass,
    MatDatepickerModule,
    MatNativeDateModule,
    NoEmojiDirective,
    UpperCaseDirective,
    LowerCaseDirective,
    LimitDirective,
    CharacterOnlyDirective,
    MatSelectModule,
    FormsModule,
    MatRadioModule,
    MatCheckboxModule
  ],
  providers: [provideNativeDateAdapter()],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './input-control.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputControl extends InputControlBase<any> {

  options = input<{ label: string; value: any }[]>([]);
  removeBg = input<boolean>(false);
  designType = input<'static' | 'dynamic'>('static');
  items = input<any[]>([]); // For select, radio
  placeholder = input<string>('');
  className = input<string>('');
  radioOrientation = input<'horizontal' | 'vertical'>('horizontal');
  rows = input<number>(3); // For textarea
  minDate = input<Date | null>(null);
  maxDate = input<Date | null>(null);
  controlId = 'input-' + Math.random().toString(36).substr(2, 9);

  // New Inputs from snippet
  hideIcon = input<boolean>(false);
  search = input<boolean>(false);
  multiple = input<boolean>(false);
  enableSelectSearch = input<boolean>(false);
  key = input<string>(''); // Key for value
  keyName = input<string>(''); // Key for label/display
  sort = input<string>('');
  defaultOption = input<string>('');

  // Internal state for Select Search
  selectSearchInput = signal('');

  // Computed for filtering and sorting items (replaces pipe)
  filteredItems = computed(() => {
    let items = this.items() || [];
    const query = this.selectSearchInput().toLowerCase();
    const keyName = this.keyName();
    const sortKey = this.sort() || keyName;

    // Filter
    if (query && keyName) {
      items = items.filter(item =>
        item[keyName]?.toString().toLowerCase().includes(query)
      );
    }

    // Sort (simple string sort)
    if (sortKey) {
      items = [...items].sort((a, b) => { // Create a copy to avoid mutating prop
        const valA = a[sortKey] ? a[sortKey].toString().toLowerCase() : '';
        const valB = b[sortKey] ? b[sortKey].toString().toLowerCase() : '';
        return valA.localeCompare(valB);
      });
    }

    return items;
  });

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

}
