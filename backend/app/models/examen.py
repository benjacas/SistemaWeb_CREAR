from sqlalchemy import Column, Text, Date, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Examen(Base):
    __tablename__ = "examen"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    grupo_clase_id = Column(UUID(as_uuid=True), ForeignKey("grupo_clase.id"), nullable=False)
    fecha = Column(Date, nullable=False)
    descripcion = Column(Text, nullable=True)
