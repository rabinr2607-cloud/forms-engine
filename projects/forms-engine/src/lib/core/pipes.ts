import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'filterAndSort',
    pure: true
})
export class FilterAndSortPipe implements PipeTransform {

    transform<T extends Record<string, any>>(
        items: T[] | null | undefined,
        filter: string,
        filterName: keyof T,
        sort: boolean
    ): T[] {

        if (!items?.length) return [];

        const filterLower = filter?.toLowerCase();
        let result = items;

        // Filter first to reduce sort workload
        if (filterLower) {
            result = items.filter(item =>
                item[filterName]?.toString().toLowerCase().includes(filterLower)
            );
        }

        // Only clone array if sorting (avoid unnecessary spread)
        if (sort && result.length > 1) {
            return result.slice().sort((a, b) => {
                const valA = (a[filterName]?.toString() || '').toLowerCase();
                const valB = (b[filterName]?.toString() || '').toLowerCase();
                return valA.localeCompare(valB);
            });
        }

        return result;
    }
}
