import enum

from sqlalchemy import Column, String, Date, Enum, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class RolUsuario(str, enum.Enum):
    administrador = "administrador"
    secretaria = "secretaria"
    profesor = "profesor"
    alumno = "alumno"
    tutor = "tutor"
    # ⚠️ valores no confirmados contra la base real — tomados de la
    # convención de roles ya documentada en el Claude.md del portal
    # (administrador/secretaria/profesor/alumno/tutor), no de un enum
    # de Postgres verificado. Confirmar antes de aplicar en producción.


class EstadoUsuario(str, enum.Enum):
    activo = "activo"
    inactivo = "inactivo"
    # ⚠️ solo 'activo' está confirmado como default real — el resto de
    # los valores posibles del enum de Postgres no se verificó todavía.


class Usuario(Base):
    __tablename__ = "usuario"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    rol = Column(Enum(RolUsuario, name="rol_usuario"), nullable=False)
    # server_default (no default= de Python) — así el valor por defecto
    # también aplica en INSERTs de SQL crudo, no solo por el ORM. Ver
    # Claude.md / SCHEMA.md, "default vs server_default en enums".
    estado = Column(Enum(EstadoUsuario, name="estado_usuario"), nullable=False, server_default=text("'activo'"))
    fecha_alta = Column(Date, nullable=False, server_default=text("CURRENT_DATE"))
    # NULLABLE por ahora — se completa en la Fase 3 (login real). Reemplaza
    # a un eventual auth_user_id de un proveedor externo: la decisión fue
    # manejar auth con password_hash propio en esta misma tabla en vez de
    # delegarlo (ver Claude.md, decisión de auth).
    password_hash = Column(String, nullable=True)
