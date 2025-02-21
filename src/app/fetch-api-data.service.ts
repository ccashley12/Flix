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
    console.log('Registering with:', userDetails);

    return this.http
      .post(apiUrl + 'users', userDetails, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json'}),
      })
      .pipe(
        map((response) => {
          console.log('Registration successful:', response);
          return response;
        }),
        catchError(this.handleError),
    );
  };

  //User Login (stored token)
  public userLogin(userDetails: any): Observable<any> {
    return this.http.post(apiUrl + 'login', userDetails)
      .pipe(
        map((response: any) => {
          if(response.token) {
            localStorage.setItem('token', response.token); //token stored after user logs in
          }
          return response;
        }),
        catchError(this.handleError),
      );
  };

  //Get Authorization headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  };

  //Get ALL movies
  public getAllMovies(): Observable<any> {
    return this.http
      .get(apiUrl + 'movies', {headers: this.getAuthHeaders() })
      .pipe(map(this.extractResponseData), 
      catchError(this.handleError));
  };

  //Get single movie
  public getMovie(movieId: string): Observable<any> {
    return this.http
      .get(apiUrl + `movies/${movieId}`, {headers: this.getAuthHeaders() })
      .pipe(map(this.extractResponseData),
      catchError(this.handleError));
  };

  //Get director info
  public getDirector(directorName: string): Observable<any> {
    return this.http
      .get(apiUrl + `directors/${directorName}`, { headers: this.getAuthHeaders() })
      .pipe(map(this.extractResponseData),
      catchError(this.handleError));
  };

  //Get genre info
  public getGenre(genreName: string): Observable<any> {
    return this.http
      .get(apiUrl + `genres/${genreName}`, { headers: this.getAuthHeaders() })
      .pipe(map(this.extractResponseData),
      catchError(this.handleError));
  };

  //Get user info
  public getUser(): Observable<any> {
    return this.http
      .get(apiUrl + 'users', { headers: this.getAuthHeaders() })
      .pipe(map(this.extractResponseData),
      catchError(this.handleError));
  };

  //Get user favorite movies
  public getFavoriteMovies(): Observable<any> {
    return this.http
      .get(apiUrl + 'users/favorites', { headers: this.getAuthHeaders() })
      .pipe(map(this.extractResponseData),
      catchError(this.handleError));
  };

  //Post Favorite movies to user profile
  public addFavoriteMovie(movieId: string): Observable<any> {
    return this.http
      .post(
        apiUrl + `users/favorites/${movieId}`,
        {},
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError(this.handleError));
  };

  //Edit user information
  public editUser(updatedDetails: any): Observable<any> {
    return this.http
      .put(apiUrl + 'users', updatedDetails, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  };

  //Delete user account
  public deleteUser(): Observable<any> {
    return this.http
      .delete(apiUrl + 'users', { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  };

  //Delete Movie from user account
  public removeFavoriteMovie(movieId: string): Observable<any> {
    return this.http
      .delete(apiUrl + `users/favorites/${movieId}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  };

  //Extract Response Data
  private extractResponseData(res: any): any {
    return res || {};
  };

  //Error Handling
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Backend returned status:', error.status);
    console.error('Full error response:', error);

    let errorMessage = 'Something went wrong; please try again later.';

    if (error.error) {
      try {
        let errorBody;
        if (typeof error.error === 'string') {
          errorBody = JSON.parse(error.error);
        } else {
          errorBody = error.error;
        }

        console.error('Parsed error body:', errorBody);

        if (typeof errorBody === 'string') {
          errorMessage = errorBody;
        } else if (errorBody.message) {
          errorMessage = errorBody.message;
        } else if (errorBody.errors && Array.isArray(errorBody.errors)) {
          errorMessage = errorBody.errors.map((err: any) => err.msg).join('\n');
        } else {
          errorMessage = 'An unexpected error occurred.';
        }
      } catch (parseError) {
        console.error('Error parsing backend response:', parseError);
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}