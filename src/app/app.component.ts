import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './navigation/navigation.component';
import { GenreDialogComponent } from './genre-dialog/genre-dialog.component';
import { DirectorDialogComponent } from './director-dialog/director-dialog.component';
import { MovieDetailsDialogComponent } from './movie-details-dialog/movie-details-dialog.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent, MatDialogModule],
  providers: [
    {
      provide: MatDialogRef,
      useValue: {}
    },
    GenreDialogComponent,
    DirectorDialogComponent,
    MovieDetailsDialogComponent
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'CinemaExpress';
}