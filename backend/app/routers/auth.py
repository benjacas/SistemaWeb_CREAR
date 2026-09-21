from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.usuario import Usuario
from app.models.padre_tutor import PadreTutor
from app.core.security import verificar_password, crear_token
from app.schemas.auth import LoginRequest, LoginResponse

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
def login(datos: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == datos.email).first()
    if usuario and usuario.password_hash and verificar_password(datos.password, usuario.password_hash):
        token = crear_token({"sub": str(usuario.id), "rol": usuario.rol.value, "tipo": "usuario"})
        return LoginResponse(access_token=token, rol=usuario.rol.value, nombre=usuario.nombre)

    tutor = db.query(PadreTutor).filter(PadreTutor.email == datos.email).first()
    if tutor and tutor.password_hash and verificar_password(datos.password, tutor.password_hash):
        token = crear_token({"sub": str(tutor.id), "rol": "tutor", "tipo": "padre_tutor"})
        return LoginResponse(access_token=token, rol="tutor", nombre=tutor.nombre)

    raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")
