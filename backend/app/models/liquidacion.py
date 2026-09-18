import enum

from sqlalchemy import Column, String, Date, Numeric, ForeignKey, Enum, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class EstadoLiquidacion(str, enum.Enum):
    generada = "generada"
    aprobada = "aprobada"
    pagada = "pagada"
    # ⚠️ solo 'generada' está confirmado como default real — el resto de
    # los valores posibles del enum de Postgres no se verificó todavía.


class Liquidacion(Base):
    __tablename__ = "liquidacion"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)
    periodo = Column(String, nullable=False)
    monto = Column(Numeric, nullable=False)
    # server_default (no default= de Python) — ver Claude.md / SCHEMA.md,
    # "default vs server_default en enums".
    estado = Column(Enum(EstadoLiquidacion, name="estado_liquidacion"), nullable=False, server_default=text("'generada'"))
    aprobada_por = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=True)
    fecha_aprobacion = Column(Date, nullable=True)
    fecha_pago = Column(Date, nullable=True)
