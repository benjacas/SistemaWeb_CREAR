from pydantic import BaseModel
from datetime import date
import uuid


class AsistenciaOut(BaseModel):
    id: uuid.UUID
    fecha: date
    presente: bool
    grupo_nombre: str

    class Config:
        from_attributes = True
