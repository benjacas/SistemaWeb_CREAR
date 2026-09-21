from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.calificacion import Calificacion
from app.schemas.evaluacion import EvaluacionOut, DetalleCriterioOut
from app.core.deps import obtener_identidad_actual, verificar_acceso_a_alumno

router = APIRouter()


@router.get("/alumnos/{alumno_id}/evaluaciones", response_model=list[EvaluacionOut])
def listar_evaluaciones(
    alumno_id: str,
    db: Session = Depends(get_db),
    identidad: dict = Depends(obtener_identidad_actual),
):
    verificar_acceso_a_alumno(alumno_id, identidad, db)
    calificaciones = (
        db.query(Calificacion)
        .filter(Calificacion.alumno_id == alumno_id)
        .all()
    )

    # Cada fila de Calificacion es un criterio suelto — se agrupan acá por
    # examen para devolver "un examen con varios criterios", no una lista
    # plana de calificaciones.
    examenes = {}
    for c in calificaciones:
        examen = c.examen_criterio.examen
        grupo = examen.grupo_clase
        if examen.id not in examenes:
            grupo_nombre = grupo.nombre_display or f"{grupo.disciplina.nombre} — {grupo.nivel}"
            examenes[examen.id] = EvaluacionOut(
                id=examen.id,
                titulo=examen.descripcion or f"Evaluación — {grupo_nombre}",
                grupo_nombre=grupo_nombre,
                es_profesorado=grupo.es_profesorado,
                fecha=examen.fecha,
                detalle=[],
            )
        examenes[examen.id].detalle.append(
            DetalleCriterioOut(
                criterio_nombre=c.examen_criterio.criterio.nombre,
                nota=float(c.nota),
                observaciones=c.observaciones,
            )
        )
    return list(examenes.values())
