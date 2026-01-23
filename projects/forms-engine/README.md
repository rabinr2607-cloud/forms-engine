# Forms Engine

A dynamic, zoneless Angular forms engine built with Angular 21+, Angular Material, and Signals.

## Features
- 🚀 **Zoneless**: Built entirely with Angular Signals.
- 🎨 **Material Design**: Uses Angular Material components.
- 🛠️ **Dynamic Validation**: Reactive validation updates via signals.
- 📦 **Rich Controls**: Supports Text, Date, Select (with search), Password (strength & toggle), Checkbox, Radio.
- ⚡ **Rule Engine**: Dynamic visibility and requirement logic based on form state.

## Installation

```bash
npm i @zilqora/forms-engine
```

## Setup

### 1. Import Global Styles
Add the library's styles to your application's global styles (e.g., `styles.scss`):

```scss
/* Import Angular Material Prebuilt Theme (Required) */
@import '@angular/material/prebuilt-themes/azure-blue.css';

/* Import Forms Engine Styles */
@import '@zilqora/forms-engine/src/lib/styles/form-theme.scss';
@import '@zilqora/forms-engine/src/lib/styles/forms.scss';
```

### 2. Add Ionicons
The library uses Ionicons for specific UI elements. Add the following scripts to your `index.html` head section:

```html
<script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
<script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
```

## Usage

### 1. Register Providers
Ensure you provide zoneless change detection in your `app.config.ts`:

```typescript
import { provideZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    // ...
  ]
};
```

### 2. Import Components
Import `InputControl`, `CheckboxComponent`, or `RadioComponent` into your standalone component.

```typescript
import { InputControl, CheckboxComponent, RadioComponent } from '@zilqora/forms-engine';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputControl,
    CheckboxComponent,
    RadioComponent
  ],
  // ...
})
export class MyComponent {
  form = new FormGroup({
    name: new FormControl(''),
    agree: new FormControl(false),
    gender: new FormControl('')
  });

  // Access controls helper
  get controls() { return this.form.controls; }
}
```

### 3. Template Usage

#### Generic Input Control (`zx-input-control`)
Compatible with `text`, `password`, `date`, `select`.

**Text Input**
```html
<zx-input-control 
    label="Full Name" 
    [control]="controls.name" 
    placeholder="Enter your name"
    [required]="true">
</zx-input-control>
```

**Date Picker**
```html
<zx-input-control 
    type="date"
    label="Date of Birth" 
    [control]="controls.dob" 
    [minDate]="minDate()">
</zx-input-control>
```

**Select with Search**
```html
<zx-input-control 
    type="select"
    label="Country" 
    [control]="controls.country" 
    [items]="countries()"
    key="code"
    keyName="name"
    [enableSelectSearch]="true">
</zx-input-control>
```

#### Checkbox (`lib-checkbox`)
```html
<lib-checkbox 
    label="I agree to terms" 
    [control]="controls.agree">
</lib-checkbox>
```

#### Radio Group (`lib-radio`)
```html
<lib-radio
    label="Gender"
    [control]="controls.gender"
    [options]="[{label: 'Male', value: 'M'}, {label: 'Female', value: 'F'}]">
</lib-radio>
```

> [!IMPORTANT]
> The `[control]` input is **required** for all components. Failing to provide it will result in an error.

## Rule Engine Service

The `RuleEngineService` allows you to define dynamic rules for visibility and required state based on form values.

```typescript
import { RuleEngineService, VisibilityStore, RuleMap } from '@zilqora/forms-engine';

export class MyFormComponent {
  private ruleEngine = inject(RuleEngineService);
  public v = inject(VisibilityStore); // Inject store to use in template

  constructor() {
    const rules: RuleMap<any> = [
      {
        action: 'visible',
        fields: ['otherDetails'],
        condition: (val) => val.hasDetails === true
      }
    ];

    // Initialize engine
    this.ruleEngine.init(this.injector, this.form, this.formValueSignal, rules);
  }
}
```

In template:
```html
@if (v.visible('otherDetails')()) {
  <zx-input-control label="Details" [control]="controls.otherDetails"></zx-input-control>
}
```
