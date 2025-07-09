import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { HttpClientModule } from "@angular/common/http"
import { AuthService, type LoginResponse } from "../services/auth.service"

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [AuthService],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent {
  loginData = {
    username: "",
    password: "",
  }
  isLoading = false
  showPassword = false
  loginError = ""

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    // Si ya está logueado, redirigir
    if (this.authService.isLoggedIn()) {
      this.router.navigate(["/tarjetones"])
    }
  }

  onSubmit() {
    if (!this.loginData.username || !this.loginData.password) {
      this.loginError = "Por favor, complete todos los campos"
      return
    }

    this.isLoading = true
    this.loginError = ""

    // Llamar al servicio de autenticación
    this.authService.login(this.loginData.username, this.loginData.password).subscribe({
      next: (response: LoginResponse) => {
        console.log("✅ Login exitoso:", response)

        // Guardar datos del usuario
        this.authService.saveUserData(response)

        // Redirigir a tarjetones
        this.router.navigate(["/tarjetones"])

        this.isLoading = false
      },
      error: (error: string) => {
        console.error("❌ Error en login:", error)
        this.loginError = error
        this.isLoading = false
      },
    })
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword
  }
}
