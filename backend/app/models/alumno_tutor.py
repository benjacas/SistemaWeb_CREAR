from sqlalchemy import Column, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class AlumnoTutor(Base):
    __tablename__ = "alumno_tutor"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    alumno_id = Column(UUID(as_uuid=True), ForeignKey("alumno.id"), nullable=False)
    padre_tutor_id = Column(UUID(as_uuid=True), ForeignKey("padre_tutor.id"), nullable=False)
