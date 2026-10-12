import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-signed-out',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './signed-out.html',
  styleUrl: './signed-out.css'
})
export class SignedOut {
  private readonly route = inject(ActivatedRoute);
  readonly reason = this.route.snapshot.queryParamMap.get('reason');

  get message(): string {
    if (this.reason === 'permission-denied') {
      return 'Your account does not have permission to open this page.';
    }

    if (this.reason === 'permissions-unavailable') {
      return 'Permissions could not be loaded. Check the backend API and database connection, then sign in again.';
    }

    return 'Your dashboard session has ended.';
  }

  get title(): string {
    return this.reason ? 'Access unavailable' : 'You have been signed out';
  }
}