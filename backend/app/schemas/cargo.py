from pydantic import BaseModel
from datetime import date
import uuid


class PagoOut(BaseModel):
    id: uuid.UUID
    fecha_pago: date
    monto: float
    metodo: str
    comprobante_numero: str | None = None  # formateado "anio-00047"

    class Config:
        from_attributes = True


class CargoOut(BaseModel):
    id: uuid.UUID
    concepto: str
    periodo: str | None
    monto_final: float
    descuento_aplicado: float
    recargo_aplicado: float
    estado: str
    fecha_vencimiento: date | None
    fecha_generacion: date
    pagos: list[PagoOut] = []

    class Config:
        from_attributes = True
