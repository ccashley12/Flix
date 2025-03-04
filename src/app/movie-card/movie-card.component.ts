import { Component, OnInit, ViewChild, ChangeDetectorRef, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FetchApiDataService } from '../fetch-api-data.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  MatPaginatorModule,
  PageEvent,
  MatPaginator,
} from '@angular/material/paginator';
import { MovieDetailsDialogComponent } from '../movie-details-dialog/movie-details-dialog.component';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatPaginatorModule,
  ],
})
export class MovieCardComponent implements OnInit {
  movies: any[] = [];
  displayedMovies: any[] = [];
  favoriteMovies: string[] = [];

  hidePageSize = true;
  pageSize = 6;
  pageIndex = 0;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private fetchApiData: FetchApiDataService,
    @Optional() public dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Load movies and favorites on component init
    this.fetchMovies();
    this.fetchFavorites();
  };

  // Fetch all movies from API and update the displayed movies (for pagination)
  fetchMovies(): void {
    this.fetchApiData.getAllMovies().subscribe({
      next: (movies) => {
        this.movies = movies;
        this.updateDisplayedMovies();
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error fetching movies:', err),
    });
  };

  // Fetch user's favorite movies from API and update local storage
  fetchFavorites(): void {
    this.fetchApiData.getUserFavorites().subscribe({
      next: (favorites: string[]) => {
        this.favoriteMovies = favorites;
        const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
        updatedUser.favorites = favorites;
        localStorage.setItem('user', JSON.stringify(updatedUser));
      },
      error: (err) => console.error('Error fetching favorites:', err),
    });
  };

  isFavorite(movieId: string): boolean {
    return this.favoriteMovies.includes(movieId);
  };

  toggleFavorite(movieId: string): void {
    if (this.isFavorite(movieId)) {
      // Remove from favorites
      this.fetchApiData.removeFavoriteMovie(movieId).subscribe({
        next: () => {
          this.favoriteMovies = this.favoriteMovies.filter(
            (id) => id !== movieId,
          );
          this.updateLocalFavorites();
        },
        error: (err) => console.error('Error removing favorite:', err),
      });
    } else {
      // Add to favorites
      this.fetchApiData.addFavoriteMovie(movieId).subscribe({
        next: () => {
          this.favoriteMovies.push(movieId);
          this.updateLocalFavorites();
        },
        error: (err) => console.error('Error adding favorite:', err),
      });
    }
  };

  // Helper function to update local storage & detect changes
  updateLocalFavorites(): void {
    const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
    updatedUser.favorites = this.favoriteMovies;
    localStorage.setItem('user', JSON.stringify(updatedUser));

    this.cdRef.detectChanges();
  };

  // Open movie details dialog
  openMovieDetailsDialog(movie: any): void {
    this.dialog.open(MovieDetailsDialogComponent, {
      data: { movie },
      width: '600px',
    });
  };

  // Movie display for pagination
  updateDisplayedMovies(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedMovies = this.movies.slice(startIndex, endIndex);
  };

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDisplayedMovies();
  }
}