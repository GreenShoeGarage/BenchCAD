import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BenchCadApp } from "@/components/benchcad-app"
import "@/app/globals.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BenchCadApp />
  </StrictMode>,
)
