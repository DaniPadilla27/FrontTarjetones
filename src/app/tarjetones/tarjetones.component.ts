import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { PdfGeneratorService } from "../pdf-generator.service"
import { AuthService } from "../services/auth.service"

interface Tarjeton {
  id: number
  folio: string
  operador: string
  emision: string
  vence: string
  emisionAntigua: string
  fechaAlta: string
  tipoTramite: string
  coordinacion: string
  nombreOperador: string
  genero: string
  municipio: string
  modalidad: string
  tipo: string
  estatus: string
  folioAdmon: string
  folioPago: string
  fotografia?: any
}

interface Filters {
  fechaInicial: string
  fechaFinal: string
  coordinacion: string
  municipio: string
  modalidad: string
  genero: string
  tipoTramite: string
  folioOperador: string
}

@Component({
  selector: "app-tarjetones",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./tarjetones.component.html",
  styleUrls: ["./tarjetones.component.css"],
  providers: [PdfGeneratorService],
})
export class TarjetonesComponent {
  title = "tarjetones_front"
  tarjetonesData: Tarjeton[] = []
  isLoading = false
  hasSearched = false
  isFilterModalOpen = false
  isPdfModalOpen = false
  selectedTarjeton: Tarjeton | null = null
  coordinaciones: any[] = []
  municipios: any[] = []
  modalidades: any[] = []
  generos: any[] = []
  tiposTramite: any[] = []
  isGeneratingPdf = false
  currentUser = ""

  constructor(
    private pdfGeneratorService: PdfGeneratorService,
    private router: Router,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    // Verificar autenticación al inicializar el componente
    if (!this.authService.isLoggedIn()) {
      console.log("🚫 Usuario no autenticado, redirigiendo al login")
      this.router.navigate(["/login"])
      return
    }

    // Obtener datos del usuario logueado
    const userData = this.authService.getUserData()
    if (userData) {
      this.currentUser = userData.name || userData.usuario
      console.log(`👋 Bienvenido: ${this.currentUser}`)
    }

    const today = new Date()
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(today.getDate() - 3)
    this.filters.fechaInicial = this.formatDateForInput(threeDaysAgo)
    this.filters.fechaFinal = this.formatDateForInput(today)
    this.loadCatalogos()
  }

  // Método para cerrar sesión
  logout(): void {
    console.log("🔓 Cerrando sesión...")

    // Limpiar datos de autenticación
    this.authService.logout()

    // Mostrar mensaje de confirmación
    console.log("✅ Sesión cerrada correctamente")

    // Redirigir al login
    this.router.navigate(["/login"])
  }

  filters: Filters = {
    fechaInicial: "",
    fechaFinal: "",
    coordinacion: "",
    municipio: "",
    modalidad: "",
    genero: "",
    tipoTramite: "",
    folioOperador: "",
  }

  loadCatalogos() {
    const baseUrl = "https://wstarjetones.transporteshidalgoti.org/api/catalogos"
    Promise.all([
      fetch(`${baseUrl}/coordinaciones`).then((res) => res.json()),
      fetch(`${baseUrl}/municipios`).then((res) => res.json()),
      fetch(`${baseUrl}/modalidades`).then((res) => res.json()),
      fetch(`${baseUrl}/generos`).then((res) => res.json()),
      fetch(`${baseUrl}/tramites`).then((res) => res.json()),
    ])
      .then(([coordinaciones, municipios, modalidades, generos, tramites]) => {
        this.coordinaciones = coordinaciones.map((c: any) => ({ label: c.descripcion, value: c.id }))
        this.municipios = municipios.map((m: any) => ({ label: m.descripcion, value: m.id }))
        this.modalidades = modalidades.map((m: any) => ({ label: m.descripcion, value: m.id }))
        this.generos = generos.map((g: any) => ({ label: g.descripcion, value: g.id }))
        this.tiposTramite = tramites.map((t: any) => ({ label: t.descripcion, value: t.id }))
        this.applyFilters()
      })
      .catch((error) => {
        console.error("❌ Error al cargar catálogos:", error)
      })
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  convertBufferToBase64(buffer: any, mimeType = "image/jpeg"): string {
    if (!buffer || !Array.isArray(buffer.data)) return ""
    try {
      const bytes = new Uint8Array(buffer.data)
      const binary = String.fromCharCode(...bytes)
      const base64 = btoa(binary)
      return `data:${mimeType};base64,${base64}`
    } catch (error) {
      console.error("Error al convertir buffer a base64:", error)
      return ""
    }
  }

  openFilterModal(): void {
    this.isFilterModalOpen = true
  }

  closeFilterModal(): void {
    this.isFilterModalOpen = false
  }

  openPdfModal(tarjeton: Tarjeton): void {
    this.selectedTarjeton = tarjeton
    this.isPdfModalOpen = true
  }

  closePdfModal(): void {
    this.isPdfModalOpen = false
    this.selectedTarjeton = null
  }

  resetFilters(): void {
    this.filters = {
      fechaInicial: "",
      fechaFinal: "",
      coordinacion: "all",
      municipio: "all",
      modalidad: "all",
      genero: "all",
      tipoTramite: "all",
      folioOperador: "",
    }
  }

  applyFilters(): void {
    this.isLoading = true
    const params: any = {
      fchIni: this.filters.fechaInicial,
      fchFin: this.filters.fechaFinal,
    }

    if (this.filters.coordinacion !== "all") params.idCoordinacion = this.filters.coordinacion
    if (this.filters.municipio !== "all") params.idMunicipio = this.filters.municipio
    if (this.filters.modalidad !== "all") params.idModalidad = this.filters.modalidad
    if (this.filters.genero !== "all") params.idGenero = this.filters.genero
    if (this.filters.tipoTramite !== "all") params.idTramite = this.filters.tipoTramite
    if (this.filters.folioOperador) params.idOperador = this.filters.folioOperador

    const queryString = new URLSearchParams(params).toString()
    fetch(`https://wstarjetones.transporteshidalgoti.org/api/tarjetones/filtrar?${queryString}`)
      .then((res) => res.json())
      .then((data) => {
        this.tarjetonesData = data.map((item: any) => ({
          id: Number(item.idTarjeton),
          folio: item.idTarjeton,
          operador: item.folioOperador,
          emision: item.emision,
          emisionAntigua: item.fechaEmisionAntigua,
          vence: item.vence,
          tipoTramite: item.tramite,
          coordinacion: item.coordinacion,
          nombreOperador: item.nombreOperador,
          genero: item.genero,
          municipio: item.municipio,
          modalidad: item.modalidad,
          tipo: item.tipoTarjeton,
          estatus: item.estatus,
          folioAdmon: item.folioAdministrativo,
          folioPago: item.folioPago,
          fotografia: item.fotografia,
          fechaAlta: item.fechaAlta,
        }))
        console.log("🔍 Tarjetones filtrados:", this.tarjetonesData)
        this.hasSearched = true
      })
      .catch((err) => {
        console.error("Error al filtrar tarjetones:", err)
        this.tarjetonesData = []
      })
      .finally(() => {
        this.isLoading = false
        this.closeFilterModal()
      })
  }

  viewDetails(tarjeton: Tarjeton): void {
    console.log("Ver detalles:", tarjeton)
  }

  /** Convierte "DD/MM/YYYY" → Date */
  private parseDDMMYYYY(dateStr: string): Date {
    const [dia, mes, anio] = dateStr.split("/").map(Number)
    // mes - 1 porque en JavaScript los meses van de 0 a 11
    return new Date(anio, mes - 1, dia)
  }

getAntiguedad(): string {
  const tramite = this.selectedTarjeton?.tipoTramite;
  const fechaEmisionAntiguaStr = this.selectedTarjeton?.emisionAntigua;

  if (tramite === "Expedición") {
    return "0 años";
  }

  if (fechaEmisionAntiguaStr) {
    const fechaEmisionAntigua = fechaEmisionAntiguaStr.includes("/")
      ? this.parseDDMMYYYY(fechaEmisionAntiguaStr)
      : new Date(fechaEmisionAntiguaStr);

    const hoy = new Date();
    const antiguedad = hoy.getFullYear() - fechaEmisionAntigua.getFullYear();

    return `${antiguedad} año${antiguedad !== 1 ? "s" : ""}`;
  }

  return "";
}





  downloadPdf(): void {
    if (!this.selectedTarjeton) return
    this.isGeneratingPdf = true
    this.pdfGeneratorService
      .generateTarjetonPdf(this.selectedTarjeton)
      .then(() => {
        console.log("PDF generado exitosamente")
        this.closePdfModal()
      })
      .catch((error) => {
        console.error("Error al generar PDF:", error)
        alert("Error al generar el PDF. Por favor, inténtelo de nuevo.")
      })
      .finally(() => {
        this.isGeneratingPdf = false
      })
  }

  printPdf(): void {
    if (this.selectedTarjeton) {
      console.log("Imprimiendo PDF para:", this.selectedTarjeton.folio)
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        const previewElement = document.getElementById("tarjeton-preview")
        if (previewElement) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Tarjetón ${this.selectedTarjeton.folio}</title>
                <style>
                  body { margin: 0; padding: 20px; }
                  @media print {
                    body { margin: 0; padding: 0; }
                    .print-content { width: 210mm; height: 297mm; }
                  }
                </style>
              </head>
              <body>
                <div class="print-content">
                  ${previewElement.outerHTML}
                </div>
              </body>
            </html>
          `)
          printWindow.document.close()
          printWindow.focus()
          setTimeout(() => {
            printWindow.print()
            printWindow.close()
          }, 500)
        }
      }
    }
  }

  getStatusBadgeClass(estatus: string): string {
    switch (estatus) {
      case "Vigente":
        return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
      case "Entregado":
        return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
      case "Vencido":
        return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
      case "Suspendido":
        return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
      default:
        return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
    }
  }

  getModalidadBadgeClass(modalidad: string): string {
    return modalidad === "INDIVIDUAL"
      ? "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
      : "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200"
  }

  getTipoTramiteBadgeClass(tipo: string): string {
    return tipo === "Renovación"
      ? "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
      : "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
  }

  get totalTarjetones(): number {
    return this.tarjetonesData.length
  }

  get totalVigentes(): number {
    return this.tarjetonesData.filter((t) => t.estatus === "Vigente").length
  }

  get totalIndividual(): number {
    return this.tarjetonesData.filter((t) => t.modalidad === "INDIVIDUAL").length
  }

  get totalColectivo(): number {
    return this.tarjetonesData.filter((t) => t.modalidad === "TRANSPORTE COLECTIVO").length
  }

  getCurrentDay(): string {
    return new Date().getDate().toString().padStart(2, "0")
  }

  getCurrentMonth(): string {
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]
    return meses[new Date().getMonth()]
  }

  getCurrentYear(): string {
    return new Date().getFullYear().toString()
  }

  getEmisionDay(): string {
    if (!this.selectedTarjeton?.emision) return ""
    const [day] = this.selectedTarjeton.emision.split("/")
    return day
  }

  getEmisionMonth(): string {
    if (!this.selectedTarjeton?.emision) return ""
    const [, month] = this.selectedTarjeton.emision.split("/")
    const meses = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ]
    return meses[parseInt(month, 10) - 1] || ""
  }

  getEmisionYear(): string {
    if (!this.selectedTarjeton?.emision) return ""
    const [, , year] = this.selectedTarjeton.emision.split("/")
    return year
  }

}
