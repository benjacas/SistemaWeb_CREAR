from pydantic import BaseModel
import uuid


class HorarioOut(BaseModel):
    dia_semana: str
    hora_inicio: str  # "18:00"
    hora_fin: str

    class Config:
        from_attributes = True


class ClaseOut(BaseModel):
    id: uuid.UUID
    nombre: str
    nivel: str
    profesora_nombre: str
    horarios: list[HorarioOut]

    class Config:
        from_attributes = True
