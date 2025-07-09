import type { Routes } from "@angular/router"
import { LoginComponent } from "./login/login.component"
import { TarjetonesComponent } from "./tarjetones/tarjetones.component"
import { AuthGuard } from "./guards/auth.guard"

export const routes: Routes = [
  { path: "", redirectTo: "/login", pathMatch: "full" },
  { path: "login", component: LoginComponent },
  {
    path: "tarjetones",
    component: TarjetonesComponent,
    canActivate: [AuthGuard], // Proteger la ruta con el guard
  },
  { path: "**", redirectTo: "/login" },
]
