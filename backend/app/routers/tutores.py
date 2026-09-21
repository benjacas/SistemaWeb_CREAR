from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.alumno_tutor import AlumnoTutor
from app.models.padre_tutor import PadreTutor
from app.schemas.tutor import TutorOut, TutorUpdate
from app.core.deps import obtener_identidad_actual

router = APIRouter()


@router.get("/tutores/me/alumnos")
def mis_alumnos(identidad: dict = Depends(obtener_identidad_actual), db: Session = Depends(get_db)):
    if identidad["tipo"] != "padre_tutor":
        raise HTTPException(status_code=403, detail="Este endpoint es solo para tutores")
    vinculos = db.query(AlumnoTutor).filter(AlumnoTutor.padre_tutor_id == identidad["id"]).all()
    return [
        {
            "id": str(v.alumno.id),
            "nombre": v.alumno.nombre,
            "apellido": v.alumno.apellido,
            "apto_fisico_presentado": v.alumno.apto_fisico_presentado,
            "apto_fisico_fecha": v.alumno.apto_fisico_fecha,
        }
        for v in vinculos
    ]


@router.get("/tutores/me", response_model=TutorOut)
def mi_perfil(identidad: dict = Depends(obtener_identidad_actual), db: Session = Depends(get_db)):
    if identidad["tipo"] != "padre_tutor":
        raise HTTPException(status_code=403, detail="Este endpoint es solo para tutores")
    return db.query(PadreTutor).filter(PadreTutor.id == identidad["id"]).first()


@router.patch("/tutores/me", response_model=TutorOut)
def actualizar_mi_perfil(
    datos: TutorUpdate,
    identidad: dict = Depends(obtener_identidad_actual),
    db: Session = Depends(get_db),
):
    if identidad["tipo"] != "padre_tutor":
        raise HTTPException(status_code=403, detail="Este endpoint es solo para tutores")
    tutor = db.query(PadreTutor).filter(PadreTutor.id == identidad["id"]).first()
    if datos.email is not None:
        tutor.email = datos.email
    if datos.telefono is not None:
        tutor.telefono = datos.telefono
    db.commit(); db.refresh(tutor)
    return tutor
