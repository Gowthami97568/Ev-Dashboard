import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatCardTrend = 'up' | 'down';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css'
})
export class StatCard {
  @Input({ required: true }) icon = 'bolt';
  @Input({ required: true }) label = '';
  @Input({ required: true }) value = '';
  @Input() trend: StatCardTrend = 'up';
  @Input() deltaText = '';
  @Input() footnote = '';
}
