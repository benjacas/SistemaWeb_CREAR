from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.inscripcion import Inscripcion, EstadoInscripcion
from app.schemas.clase import ClaseOut, HorarioOut
from app.core.deps import obtener_identidad_actual, verificar_acceso_a_alumno

router = APIRouter()


@router.get("/alumnos/{alumno_id}/clases", response_model=list[ClaseOut])
def listar_clases(
    alumno_id: str,
    db: Session = Depends(get_db),
    identidad: dict = Depends(obtener_identidad_actual),
):
    verificar_acceso_a_alumno(alumno_id, identidad, db)
    inscripciones = (
        db.query(Inscripcion)
        .filter(Inscripcion.alumno_id == alumno_id, Inscripcion.estado == EstadoInscripcion.activa)
        .all()
    )
    return [
        ClaseOut(
            id=i.grupo_clase.id,
            nombre=i.grupo_clase.nombre_display
                or f"{i.grupo_clase.disciplina.nombre} — {i.grupo_clase.nivel}",
            nivel=i.grupo_clase.nivel,
            profesora_nombre=f"{i.grupo_clase.profesora.nombre} {i.grupo_clase.profesora.apellido}",
            horarios=[
                HorarioOut(
                    dia_semana=h.dia_semana.value,
                    hora_inicio=h.hora_inicio.strftime("%H:%M"),
                    hora_fin=h.hora_fin.strftime("%H:%M"),
                )
                for h in i.grupo_clase.horarios
            ],
        )
        for i in inscripciones
    ]
