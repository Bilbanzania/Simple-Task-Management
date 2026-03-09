import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common'; // 🟢 Import Angular's DatePipe

@Pipe({
    name: 'timeAgo',
    standalone: true
})
export class TimeAgoPipe implements PipeTransform {
    transform(value: string | Date): string {
        if (!value) return '';

        const dateStr = typeof value === 'string' && !value.endsWith('Z') ? value + 'Z' : value.toString();
        const date = new Date(dateStr);
        const now = new Date();

        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;

        const days = Math.floor(hours / 24);

        if (days > 7) {
            const datePipe = new DatePipe('en-US');
            return datePipe.transform(date, 'MMM d, yyyy') || '';
        }

        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}