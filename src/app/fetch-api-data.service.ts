import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators'; 

//Declaring the api url that will provide data for the client app
const apiUrl = 'https://cinema-express-948d60ca8d20.herokuapp.com/';

@Injectable({
  providedIn: 'root'
})
export class FetchApiDataService {
  // Inject the HttpClient module to the constructor params
 // This will provide HttpClient to the entire class, making it available via this.http
  constructor(private http: HttpClient) {}

 // Making the api call for the user registration endpoint
 public userRegistration(userDetails: any): Observable<any> {
  return this.http
    .post(apiUrl + 'users', userDetails, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    })
    .pipe(
      map((response) => {
        return response;
      }),
      catchError(this.handleError),
    );
  };

  //User Login (stored token)
  public userLogin(userDetails: any): Observable<any> {
    return this.http
      .post<{
        token: string;
        user: { Username: string };
      }>(`${apiUrl}login`, userDetails)
      .pipe(
        map((response) => {
          if (response.token && response.user.Username) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('username', response.user.Username);
          } else {
            console.error('Invalid login response:', response);
          }
          return { token: response.token, username: response.user.Username }; // return only needed info
        }),
        catchError(this.handleError),
      );
  }

  //Get Authorization headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Error: No token found in localStorage');
      return new HttpHeaders();
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  };

  //Get ALL movies
  public getAllMovies(): Observable<any> {
    return this.http
      .get(`${apiUrl}movies`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  };

  //Get single movie details
  public getMovie(title: string): Observable<any> {
    return this.http
      .get(`${apiUrl}movies/${encodeURIComponent(title)}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError));
  };

  //Get director info
  public getDirector(directorName: string): Observable<any> {
    return this.http
      .get(apiUrl + `movies/directors/${directorName}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError));
  };

  //Get genre info
  public getGenre(genreName: string): Observable<any> {
    return this.http
      .get(apiUrl + `movies/genre/${genreName}`, { headers: this.getAuthHeaders() })
      .pipe(map(this.extractResponseData),
        catchError(this.handleError));
  };

  //Get user info
  public getUser(Username: string): Observable<any> {
    return this.http
      .get<any>(apiUrl + `users/${Username}`, { headers: this.getAuthHeaders() })
      .pipe(map(this.extractResponseData),
        catchError((error) => {
          console.error('Error fetching user info:', error);
          return this.handleError(error); // Pass the error to your error handler
        })
      );
  }
  public getUsername(): string | null {
    try {
      return localStorage.getItem('username'); // Directly get the username from localStorage
    } catch (error) {
      console.error('Error retrieving username from localStorage:', error);
      return null;
    }
  };

  //Get user favorite movies
  public getUserFavorites(): Observable<any> {
    const Username = this.getUsername();
    if (!Username) {
      console.error('Error: No username found in localStorage');
      return throwError(() => new Error('User is not logged in.'));
    }

    return this.http
      .get<{ User: { FavoriteMovies: any[] } }>
      (apiUrl + `users/${encodeURIComponent(Username)}`,
        {
          headers: this.getAuthHeaders(),
        },
      )
      .pipe(
        map((response) => {
          console.log('API response:', response);  // Log the entire response
          if (!response.User || !response.User.FavoriteMovies || !Array.isArray(response.User.FavoriteMovies)) {
            console.error('Favorites response is not an array:', response);
            return [];
          }
          const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
          updatedUser.FavoriteMovies = response.User.FavoriteMovies || [];
          localStorage.setItem('user', JSON.stringify(updatedUser));
        
          return response.User.FavoriteMovies.map((fav) => fav.movieID);
        }),
        catchError(this.handleError),
      );
  };

  //Post Favorite movies to user profile
  public addFavoriteMovie(movieID: string): Observable<any> {
    const Username = this.getUsername();
    if (!Username) {
      return throwError(() => new Error('User is not logged in.'));
    }

    return this.http
      .put(
        `${apiUrl}users/${encodeURIComponent(Username)}/movies/${movieID}`,
        {},
        { headers: this.getAuthHeaders() },
      )
      .pipe(catchError(this.handleError));
  };

  //Edit user information
  public updateUser(updatedDetails: any): Observable<any> {
    const Username = this.getUsername();
    if (!Username) {
      return throwError(() => new Error('User is not logged in.'));
    }

    return this.http
      .put<{ User: any }>(
        `${apiUrl}users/${encodeURIComponent(Username)}`,
        updatedDetails,
        {
          headers: this.getAuthHeaders(),
        },
      )
      .pipe(
        map((response) => {
          if (response.User) {
            localStorage.setItem('username', JSON.stringify(response.User));

            if (response.User.Username && response.User.Username !== Username) {
              localStorage.setItem('username', response.User.Username);
            }
          }
          return response;
        }),
        catchError(this.handleError),
      );
  };

  //Delete user account
  public deleteUser(): Observable<any> {
    return this.http
      .delete(apiUrl + 'users', { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  };

  //Delete favorite movie from user account
  public removeFavoriteMovie(movieID: string): Observable<any> {
    const Username = this.getUsername();
    if (!Username) {
      return throwError(() => new Error('User is not logged in.'));
    }

    return this.http
      .delete(
        `${apiUrl}users/${encodeURIComponent(Username)}/favorites/${movieID}`,
        { headers: this.getAuthHeaders() },
      )
      .pipe(catchError(this.handleError));
  };

  //Extract Response Data
  private extractResponseData(res: any): any {
    return res || {};
  };

  //Error Handling
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Backend returned status:', error.status);
    console.error('Raw error response:', error.error);

    let errorMessage = 'Something went wrong; please try again later.';

    if (error.error) {
      try {
        let errorBody: any;
        if (typeof error.error === 'string') {
          console.error('Error is a string:', error.error);
          errorBody = JSON.parse(error.error);
        } else {
          errorBody = error.error;
        }

        console.error('Parsed error body:', errorBody);

        if (typeof errorBody === 'string') {
          errorMessage = errorBody;
        } else if (errorBody.message) {
          errorMessage = errorBody.message;
        }

        if (errorBody.errors) {
          console.error('Validation errors object:', errorBody.errors);

          if (
            typeof errorBody.errors === 'object' &&
            !Array.isArray(errorBody.errors)
          ) {
            errorMessage = Object.keys(errorBody.errors)
              .map((field) => `${field}: ${errorBody.errors[field]}`)
              .join('\n');
          } else if (Array.isArray(errorBody.errors)) {
            errorMessage = errorBody.errors
              .map((err: any) => err.msg || JSON.stringify(err))
              .join('\n');
          }
        }

        if (!errorMessage) {
          errorMessage = 'An unexpected error occurred.';
        }
      } catch (parseError) {
        console.error('Error parsing backend response:', parseError);
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}