from sqlalchemy import Column, Integer, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class ExamenCriterio(Base):
    __tablename__ = "examen_criterio"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    examen_id = Column(UUID(as_uuid=True), ForeignKey("examen.id"), nullable=False)
    criterio_id = Column(UUID(as_uuid=True), ForeignKey("criterio_evaluacion.id"), nullable=False)
    orden = Column(Integer, nullable=True)

    examen = relationship("Examen")
    criterio = relationship("CriterioEvaluacion")
