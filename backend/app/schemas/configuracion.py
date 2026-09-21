from pydantic import BaseModel


class ConfiguracionOut(BaseModel):
    plazo_dias_apto_fisico: int
    umbral_asistencia_alerta: float

    class Config:
        from_attributes = True
