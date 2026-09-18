import enum

from sqlalchemy import Column, String, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import text

from app.db.base import Base


class Parentesco(str, enum.Enum):
    madre = "madre"
    padre = "padre"
    tutor = "tutor"
    abuelo_abuela = "abuelo_abuela"
    otro = "otro"
    # ⚠️ valores no confirmados contra la base real — ninguno viene dado
    # por el spec original, son una propuesta razonable a validar.


class PadreTutor(Base):
    __tablename__ = "padre_tutor"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    email = Column(String, nullable=True)
    telefono = Column(String, nullable=True)
    parentesco = Column(Enum(Parentesco, name="parentesco"), nullable=True)
    # NULLABLE por ahora — se completa en la Fase 3 (login real). Mismo
    # motivo que en usuario.py: sin auth_user_id, auth propio acá.
    password_hash = Column(String, nullable=True)
