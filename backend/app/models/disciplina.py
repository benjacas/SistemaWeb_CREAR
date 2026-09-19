from sqlalchemy import Column, String, Boolean, Numeric, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Disciplina(Base):
    __tablename__ = "disciplina"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    nombre = Column(String, nullable=False, unique=True)
    # Corregido en la Fase B6: la Fase B4 había sacado este default
    # asumiendo que el original no lo tenía, pero contra
    # schema_original_supabase.sql (fuente primaria, no una descripción de
    # ella) sí lo tiene: "tiene_profesorado boolean NOT NULL DEFAULT false".
    tiene_profesorado = Column(Boolean, nullable=False, server_default=text("false"))
    arancel_base = Column(Numeric, nullable=True)
    activo = Column(Boolean, nullable=False, server_default=text("true"))
