import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-signed-out',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './signed-out.html',
  styleUrl: './signed-out.css'
})
export class SignedOut {}