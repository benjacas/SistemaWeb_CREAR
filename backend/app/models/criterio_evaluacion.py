from sqlalchemy import Column, String, Text, Boolean, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class CriterioEvaluacion(Base):
    __tablename__ = "criterio_evaluacion"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    nombre = Column(String, nullable=False, unique=True)
    descripcion = Column(Text, nullable=True)
    activo = Column(Boolean, nullable=False, server_default=text("true"))
