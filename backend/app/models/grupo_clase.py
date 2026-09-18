import enum

from sqlalchemy import Column, String, Boolean, Integer, Numeric, ForeignKey, Enum, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class EstadoGrupo(str, enum.Enum):
    activo = "activo"
    inactivo = "inactivo"
    # ⚠️ solo 'activo' está confirmado como default real — el resto de
    # los valores posibles del enum de Postgres no se verificó todavía.


class GrupoClase(Base):
    __tablename__ = "grupo_clase"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    disciplina_id = Column(UUID(as_uuid=True), ForeignKey("disciplina.id"), nullable=False)
    # Sin default: el schema original ("es_profesorado bool", sin la
    # palabra "default") no le daba uno. Había quedado con default=False de
    # más en la Fase B2, corregido en la auditoría de la Fase B4.
    es_profesorado = Column(Boolean, nullable=False)
    nivel = Column(String, nullable=True)
    orden = Column(Integer, nullable=True)
    nombre_display = Column(String, nullable=True)
    profesora_id = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)
    # server_default (no default= de Python) — ver Claude.md / SCHEMA.md,
    # "default vs server_default en enums".
    estado = Column(Enum(EstadoGrupo, name="estado_grupo"), nullable=False, server_default=text("'activo'"))
    arancel_mensual = Column(Numeric, nullable=True)
