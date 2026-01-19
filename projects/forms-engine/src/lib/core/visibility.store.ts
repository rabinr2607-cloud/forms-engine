import { Injectable, signal, computed } from '@angular/core';
import { VisibilityState } from './types';

@Injectable({ providedIn: 'root' })
export class VisibilityStore {
    private state = signal<VisibilityState>({});

    visible(key: string) {
        return computed(() => this.state()[key] !== false); // Default to true if undefined
    }

    setVisibility(state: VisibilityState) {
        this.state.update(current => ({ ...current, ...state }));
    }

    // Helper to update single field
    setVisible(key: string, isVisible: boolean) {
        this.state.update(s => ({ ...s, [key]: isVisible }));
    }
}
