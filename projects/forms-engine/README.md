# Forms Engine

A dynamic, zoneless Angular forms engine built with Angular 21+, Angular Material, and Signals.

## Features
- 🚀 **Zoneless**: Built entirely with Angular Signals.
- 🎨 **Material Design**: Uses Angular Material components.
- 🛠️ **Dynamic Validation**: Reactive validation updates via signals.
- 📦 **Rich Controls**: Supports Text, Date, Select (with search), Password (strength & toggle), Checkbox, Radio.
- 🔧 **Legacy Support**: Compatible with legacy `InputControlBase` logic.

## Installation

```bash
npm install forms-engine
```

## Setup

### 1. Import Global Styles
Add the library's styles to your application's global styles (e.g., `styles.scss`):

```scss
/* Import Angular Material Prebuilt Theme (Required) */
@import '@angular/material/prebuilt-themes/azure-blue.css';

/* Import Forms Engine Styles */
@import 'forms-engine/lib/styles/form-theme.scss';
@import 'forms-engine/lib/styles/forms.scss';
```

### 2. Add Ionicons
The library uses Ionicons for specific UI elements. Add the following scripts to your `index.html` head section:

```html
<script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
<script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
```

## Usage

Import `InputControl` (selector: `xy-input-control`) into your component.

```typescript
import { InputControl } from 'forms-engine';

@Component({
  standalone: true,
  imports: [InputControl, ReactiveFormsModule],
  // ...
})
export class MyComponent {
  myControl = new FormControl('');
  
  // Date Control
  startDate = new FormControl(null);
  minDate = signal(new Date());

  // Select Control
  cityControl = new FormControl('');
  cities = signal([{id: 1, name: 'New York'}, {id: 2, name: 'London'}]);
}
```

### Examples

#### Text Input
```html
<xy-input-control 
    label="Username" 
    [control]="myControl" 
    placeholder="Enter username"
    [required]="true">
</xy-input-control>
```

#### Date Picker
```html
<xy-input-control 
    type="date"
    label="Start Date" 
    [control]="startDate" 
    [minDate]="minDate()"
    placeholder="Select date">
</xy-input-control>
```

#### Select with Search
```html
<xy-input-control 
    type="select"
    label="City" 
    [control]="cityControl" 
    [items]="cities()"
    key="id"
    keyName="name"
    [enableSelectSearch]="true"
    placeholder="Select a city">
</xy-input-control>
```

#### Password with Strength
```html
<xy-input-control 
    type="password"
    label="Password" 
    [control]="myControl"
    [passwordStrength]="true">
</xy-input-control>
```

## API

### Inputs (`xy-input-control`)
| Input | Type | Default | Description |
|---|---|---|---|
| `type` | `string` | `'text'` | Control type: `text`, `date`, `select`, `password`, `radio`, `checkbox`. |
| `label` | `string` | `''` | Field label. |
| `control` | `FormControl` | - | The Angular FormControl instance. |
| `items` | `any[]` | `[]` | Data source for `select` and `radio`. |
| `key` | `string` | `''` | property name for value (e.g. 'id'). |
| `keyName` | `string` | `''` | property name for display (e.g. 'name'). |
| `minDate` | `Date` | `null` | Minimum date for datepicker. |
| `maxDate` | `Date` | `null` | Maximum date for datepicker. |
| `required` | `boolean` | `false` | Marks field as required. |
| `disabled` | `boolean` | `false` | Disables the control. |
| `inputMode` | `string` | `''` | HTML input mode (e.g. `numeric`). |

*(Refer to source code for full list of inputs)*
