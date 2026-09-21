from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.security import decodificar_token
from app.models.alumno_tutor import AlumnoTutor

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def obtener_identidad_actual(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        payload = decodificar_token(token)
        return {"id": payload["sub"], "rol": payload["rol"], "tipo": payload["tipo"]}
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido o vencido")


def verificar_acceso_a_alumno(alumno_id: str, identidad: dict, db: Session):
    if identidad["tipo"] == "usuario":
        return  # staff, sin restricción por ahora (no es el alcance de esta fase)
    vinculo = db.query(AlumnoTutor).filter(
        AlumnoTutor.padre_tutor_id == identidad["id"],
        AlumnoTutor.alumno_id == alumno_id,
    ).first()
    if not vinculo:
        raise HTTPException(status_code=403, detail="No tenés acceso a este alumno")
