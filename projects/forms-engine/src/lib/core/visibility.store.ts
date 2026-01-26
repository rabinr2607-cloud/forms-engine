
import { Injectable, signal, computed } from '@angular/core';

export interface VisibilityState {
    [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class VisibilityStore {
    private state = signal<VisibilityState>({});

    /**
     * Get visibility signal for a specific field
     */
    visible(key: string) {
        return computed(() => this.state()[key] !== false);
    }

    /**
     * Batch update visibility state
     */
    setVisibility(state: Partial<VisibilityState>) {
        this.state.update(current => ({ ...current, ...state }));
    }

    /**
     * Update single field visibility
     */
    setVisible(key: string, isVisible: boolean) {
        this.state.update(s => ({ ...s, [key]: isVisible }));
    }

    /**
     * Reset all visibility
     */
    reset() {
        this.state.set({});
    }

    /**
     * Get current state snapshot
     */
    getState(): VisibilityState {
        return this.state();
    }
}
