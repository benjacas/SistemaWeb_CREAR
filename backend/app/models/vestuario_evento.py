from sqlalchemy import Column, String, Text, Numeric, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class VestuarioEvento(Base):
    """TABLA NUEVA, propuesta, sin confirmar con la compañera.

    El frontend ya construyó un módulo de vestuario por evento en paralelo
    (ver src/mock/fixtures.js → vestuarioPorEventoDemo) — revisar que el
    shape de acá termine alineado con lo que ese mock asume antes de
    conectarlos, puede haber diverger campos.
    """

    __tablename__ = "vestuario_evento"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    evento_institucional_id = Column(UUID(as_uuid=True), ForeignKey("evento_institucional.id"), nullable=False)
    nombre = Column(String, nullable=False)
    descripcion = Column(Text, nullable=True)
    precio = Column(Numeric, nullable=False)
