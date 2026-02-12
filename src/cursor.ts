export class Cursor {
    selected_index?: number;
    count: number;

    constructor() {
        this.count = 0;
    }

    is_selecting(index: number): boolean {
        return this.selected_index === index;
    }

    set_count(count: number): void {
        this.count = count;
    }

    clear(): void {
        this.selected_index = undefined;
    }

    select_index(index: number) {
        this.selected_index = index;
    }

    down(): void {
        const count = this.count;
        this.selected_index = ((this.selected_index ?? -1) + 1) % count;
    }

    up(): void {
        if (this.selected_index === undefined || this.selected_index === 0) {
            return;
        }
        this.selected_index -= 1;
    }
}
