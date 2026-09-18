from sqlalchemy import Column, String, Text, Integer, Numeric, Boolean, DateTime, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class ConfiguracionSistema(Base):
    __tablename__ = "configuracion_sistema"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    nombre_institucion = Column(String, nullable=False, server_default=text("'Escuela de Danzas CREAR'"))
    direccion = Column(Text, nullable=True)
    telefono_contacto = Column(String, nullable=True)
    email_contacto = Column(String, nullable=True)
    cbu_alias_transferencia = Column(String, nullable=True)
    leyenda_comprobante = Column(Text, nullable=True)
    arancel_cuota_base = Column(Numeric, nullable=False, server_default=text("40000"))
    arancel_matricula_base = Column(Numeric, nullable=False, server_default=text("20000"))
    dia_vencimiento_cuota = Column(Integer, nullable=False, server_default=text("10"))
    porcentaje_recargo_mora = Column(Numeric, nullable=False, server_default=text("5"))
    porcentaje_descuento_familiar = Column(Numeric, nullable=False, server_default=text("10"))
    # NOTA: el mock del frontend (configInstitucionalDemo.plazoDiasAptoFisico
    # en mock/fixtures.js) usa 365, no 30 — discrepancia a resolver con la
    # compañera antes de conectar el portal a este valor real.
    umbral_asistencia_alerta = Column(Numeric, nullable=False, server_default=text("75"))
    plazo_dias_apto_fisico = Column(Integer, nullable=False, server_default=text("30"))
    cupo_maximo_default = Column(Integer, nullable=False, server_default=text("25"))
    habilitar_mercadopago = Column(Boolean, nullable=False, server_default=text("false"))
    mp_public_key = Column(String, nullable=True)
    # dato sensible — nunca exponerlo en ninguna respuesta de API, ni
    # siquiera a roles admin; solo lo lee el backend internamente para
    # hablar con Mercado Pago. No incluir en ningún schema de salida/response.
    mp_access_token = Column(String, nullable=True)
    actualizado_en = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    actualizado_por = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=True)
