from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import health, asistencia, cargos, auth, tutores, clases, evaluaciones, configuracion

app = FastAPI(title="CREAR API")

# Sin esto el navegador bloquea la llamada del frontend (Vite, puerto 5173)
# aunque el backend responda bien — es un bloqueo del lado del browser, no del server.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(asistencia.router)
app.include_router(cargos.router)
app.include_router(auth.router)
app.include_router(tutores.router)
app.include_router(clases.router)
app.include_router(evaluaciones.router)
app.include_router(configuracion.router)
