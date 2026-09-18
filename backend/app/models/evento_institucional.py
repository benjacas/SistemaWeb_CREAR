import enum

from sqlalchemy import Column, String, Text, Date, Time, ForeignKey, Enum, text
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.db.base import Base


class TipoEvento(str, enum.Enum):
    gala = "gala"
    otro = "otro"
    # ⚠️ valores no confirmados contra la base real — tomados del mock del
    # portal (mock/fixtures.js → eventosDemo), no de un enum verificado.


class EventoInstitucional(Base):
    __tablename__ = "evento_institucional"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    titulo = Column(String, nullable=False)
    # server_default (no default= de Python) — ver Claude.md / SCHEMA.md,
    # "default vs server_default en enums".
    tipo = Column(Enum(TipoEvento, name="tipo_evento"), nullable=False, server_default=text("'otro'"))
    fecha_evento = Column(Date, nullable=False)
    hora_evento = Column(Time, nullable=True)
    lugar = Column(String, nullable=True)
    descripcion = Column(Text, nullable=True)
    fecha_limite_pago = Column(Date, nullable=True)
    creado_por = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)
    # NUEVO, propuesto, sin confirmar con la compañera — forma:
    # { sectores: [{ nombre, filas, columnas, precio }] }, igual que
    # eventosDemo en mock/fixtures.js del portal. `null` = evento sin
    # butacas/reserva (entrada libre). JSONB en vez de tablas normalizadas
    # de sectores/asientos porque el mapa es fijo por evento y no se
    # reutiliza entre eventos — a revisar si algún día hace falta reportar
    # ocupación agregada por sector con SQL.
    mapa_asientos = Column(JSONB, nullable=True)
