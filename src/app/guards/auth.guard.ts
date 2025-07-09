import { Injectable, inject } from "@angular/core"
import { Router } from "@angular/router"
import { AuthService } from "../services/auth.service"

@Injectable({
  providedIn: "root",
})
export class AuthGuard {
  private authService = inject(AuthService)
  private router = inject(Router)

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true
    } else {
      console.log("🚫 Acceso denegado - Usuario no autenticado")
      this.router.navigate(["/login"])
      return false
    }
  }
}
