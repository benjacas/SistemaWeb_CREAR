from sqlalchemy import Column, Text, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class GrupoFamiliar(Base):
    __tablename__ = "grupo_familiar"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    observaciones = Column(Text, nullable=True)
