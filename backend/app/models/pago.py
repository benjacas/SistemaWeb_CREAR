import enum

from sqlalchemy import Column, Text, Date, Numeric, ForeignKey, Enum, CheckConstraint, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class MetodoPago(str, enum.Enum):
    efectivo = "efectivo"
    transferencia = "transferencia"
    mercadopago = "mercadopago"
    # ⚠️ valores no confirmados contra la base real — tomados del mock del
    # portal (utils/format.js → infoMetodoPago), no de un enum verificado.


class Pago(Base):
    __tablename__ = "pago"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    cargo_id = Column(UUID(as_uuid=True), ForeignKey("cargo.id"), nullable=False)
    fecha_pago = Column(Date, nullable=False, server_default=text("CURRENT_DATE"))
    monto = Column(Numeric, nullable=False)
    metodo = Column(Enum(MetodoPago, name="metodo_pago"), nullable=False)
    referencia_externa = Column(Text, nullable=True)
    comprobante_id = Column(UUID(as_uuid=True), ForeignKey("comprobante.id"), nullable=True)
    registrado_por = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)

    __table_args__ = (
        CheckConstraint("fecha_pago <= CURRENT_DATE", name="pago_fecha_pago_check"),
        CheckConstraint("monto > 0", name="pago_monto_check"),
    )
