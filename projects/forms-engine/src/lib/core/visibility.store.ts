import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VisibilityStore {
    private state = signal<any>({});

    visible(key: string) {
        return computed(() => this.state()[key] !== false); // Default to true if undefined
    }

    setVisibility(state: any) {
        this.state.update(current => ({ ...current, ...state }));
    }

    // Helper to update single field
    setVisible(key: string, isVisible: boolean) {
        this.state.update(s => ({ ...s, [key]: isVisible }));
    }
}
