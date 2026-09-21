from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.asistencia import Asistencia
from app.models.inscripcion import Inscripcion
from app.schemas.asistencia import AsistenciaOut
from app.core.deps import obtener_identidad_actual, verificar_acceso_a_alumno

router = APIRouter()


@router.get("/alumnos/{alumno_id}/asistencia", response_model=list[AsistenciaOut])
def listar_asistencia(
    alumno_id: str,
    db: Session = Depends(get_db),
    identidad: dict = Depends(obtener_identidad_actual),
):
    verificar_acceso_a_alumno(alumno_id, identidad, db)
    registros = (
        db.query(Asistencia)
        .join(Inscripcion, Asistencia.inscripcion_id == Inscripcion.id)
        .filter(Inscripcion.alumno_id == alumno_id)
        .order_by(Asistencia.fecha.desc())
        .all()
    )
    return [
        AsistenciaOut(
            id=r.id, fecha=r.fecha, presente=r.presente,
            grupo_nombre=r.inscripcion.grupo_clase.nombre_display
                or f"{r.inscripcion.grupo_clase.disciplina.nombre} — {r.inscripcion.grupo_clase.nivel}",
        )
        for r in registros
    ]
