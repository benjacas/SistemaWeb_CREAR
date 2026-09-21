from pydantic import BaseModel
from datetime import date
import uuid


class DetalleCriterioOut(BaseModel):
    criterio_nombre: str
    nota: float
    observaciones: str | None

    class Config:
        from_attributes = True


class EvaluacionOut(BaseModel):
    id: uuid.UUID
    titulo: str
    grupo_nombre: str
    # No estaba en el schema original pedido — se agregó porque
    # Evaluaciones.jsx filtra por esto ("solo Profesorado") y no hay otra
    # fuente de este dato del lado del front (ClaseOut tampoco lo expone).
    # Sale gratis: el join a grupo_clase ya hacía falta para grupo_nombre.
    es_profesorado: bool
    fecha: date
    detalle: list[DetalleCriterioOut]

    class Config:
        from_attributes = True
