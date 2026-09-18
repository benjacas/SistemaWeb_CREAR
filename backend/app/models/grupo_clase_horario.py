import enum

from sqlalchemy import Column, Time, ForeignKey, Enum, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class DiaSemana(str, enum.Enum):
    lunes = "lunes"
    martes = "martes"
    miercoles = "miercoles"
    jueves = "jueves"
    viernes = "viernes"
    sabado = "sabado"
    # Valores confirmados contra la base real — sin domingo a propósito.


class GrupoClaseHorario(Base):
    __tablename__ = "grupo_clase_horario"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    grupo_clase_id = Column(UUID(as_uuid=True), ForeignKey("grupo_clase.id"), nullable=False)
    dia_semana = Column(Enum(DiaSemana, name="dia_semana"), nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)
