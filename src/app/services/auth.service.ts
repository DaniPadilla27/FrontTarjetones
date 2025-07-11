import { Injectable } from "@angular/core"
import { HttpClient, HttpErrorResponse } from "@angular/common/http"
import { type Observable, throwError } from "rxjs"
import { catchError } from "rxjs/operators"

export interface LoginRequest {
  usuario: string
  password: string
}

export interface LoginResponse {
  status: boolean
  usuario: string
  name: string
  pCnf: boolean
  pUsu: boolean
  idRegion: number | null
  pPanel: boolean
  message: string
}

export interface ErrorResponse {
  error: string
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = "https://wstarjetones.transporteshidalgoti.org/api"

  constructor(private http: HttpClient) {}

  login(usuario: string, password: string): Observable<LoginResponse> {
    const loginData: LoginRequest = {
      usuario,
      password,
    }

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginData).pipe(catchError(this.handleError))
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = "Error desconocido"

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`
    } else {
      // Error del lado del servidor
      if (error.error && error.error.error) {
        errorMessage = error.error.error
      } else {
        errorMessage = `Error ${error.status}: ${error.message}`
      }
    }

    return throwError(() => errorMessage)
  }

  // Métodos para manejar el estado de autenticación
  saveUserData(userData: LoginResponse): void {
    localStorage.setItem("isLoggedIn", "true")
    localStorage.setItem("userData", JSON.stringify(userData))
    localStorage.setItem("username", userData.usuario)
  }

  logout(): void {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userData")
    localStorage.removeItem("username")
  }

  isLoggedIn(): boolean {
    return localStorage.getItem("isLoggedIn") === "true"
  }

  getUserData(): LoginResponse | null {
    const userData = localStorage.getItem("userData")
    return userData ? JSON.parse(userData) : null
  }
}
