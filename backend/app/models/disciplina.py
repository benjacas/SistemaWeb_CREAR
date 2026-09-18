from sqlalchemy import Column, String, Boolean, Numeric, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Disciplina(Base):
    __tablename__ = "disciplina"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    nombre = Column(String, nullable=False, unique=True)
    # Sin default: en el schema original ("tiene_profesorado bool", sin la
    # palabra "default" — a diferencia de "activo bool default true" en la
    # misma tabla) no lo tenía. Había quedado con default=False de más en
    # la Fase B2, corregido en la auditoría de la Fase B4 (no se convirtió
    # a server_default porque no debería tener ningún default).
    tiene_profesorado = Column(Boolean, nullable=False)
    arancel_base = Column(Numeric, nullable=True)
    activo = Column(Boolean, nullable=False, server_default=text("true"))
