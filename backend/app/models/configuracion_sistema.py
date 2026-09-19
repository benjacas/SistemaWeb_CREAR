from sqlalchemy import Column, String, Text, Integer, Numeric, Boolean, DateTime, ForeignKey, CheckConstraint, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class ConfiguracionSistema(Base):
    __tablename__ = "configuracion_sistema"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    nombre_institucion = Column(String, nullable=False, server_default=text("'Escuela de Danzas CREAR'"))
    direccion = Column(Text, nullable=True, server_default=text("'Barrio Observatorio, Córdoba'"))
    telefono_contacto = Column(String, nullable=True)
    email_contacto = Column(String, nullable=True)
    cbu_alias_transferencia = Column(String, nullable=True)
    leyenda_comprobante = Column(
        Text, nullable=True,
        server_default=text("'Comprobante administrativo interno - Escuela de Danzas CREAR'"),
    )
    arancel_cuota_base = Column(Numeric, nullable=False, server_default=text("40000.00"))
    arancel_matricula_base = Column(Numeric, nullable=False, server_default=text("20000.00"))
    dia_vencimiento_cuota = Column(Integer, nullable=False, server_default=text("10"))
    porcentaje_recargo_mora = Column(Numeric, nullable=False, server_default=text("5.00"))
    porcentaje_descuento_familiar = Column(Numeric, nullable=False, server_default=text("10.00"))
    # NOTA: el mock del frontend (configInstitucionalDemo.plazoDiasAptoFisico
    # en mock/fixtures.js) usa 365, no 30 — discrepancia a resolver con la
    # compañera antes de conectar el portal a este valor real.
    umbral_asistencia_alerta = Column(Numeric, nullable=False, server_default=text("75.00"))
    plazo_dias_apto_fisico = Column(Integer, nullable=False, server_default=text("30"))
    cupo_maximo_default = Column(Integer, nullable=False, server_default=text("25"))
    habilitar_mercadopago = Column(Boolean, nullable=False, server_default=text("false"))
    mp_public_key = Column(String, nullable=True)
    # dato sensible — nunca exponerlo en ninguna respuesta de API, ni
    # siquiera a roles admin; solo lo lee el backend internamente para
    # hablar con Mercado Pago. No incluir en ningún schema de salida/response.
    mp_access_token = Column(String, nullable=True)
    # dato sensible — mismo criterio que mp_access_token. Faltaba del todo
    # en el modelo, agregada en la Fase B6 contra schema_original_supabase.sql.
    kapso_api_key = Column(String, nullable=True)
    # clock_timestamp() (no now()) a propósito: now()/CURRENT_TIMESTAMP
    # devuelve la hora de inicio de la transacción (congelada durante toda
    # la transacción), clock_timestamp() devuelve la hora real del reloj en
    # el momento exacto del UPDATE — lo correcto para un "última
    # modificación" real. Confirmado contra schema_original_supabase.sql,
    # que también usa clock_timestamp() acá y en registro_auditoria.fecha_hora
    # (esa segunda también se había puesto now() por error — corregido en
    # la Fase B6).
    actualizado_en = Column(DateTime(timezone=True), nullable=False, server_default=text("clock_timestamp()"))
    actualizado_por = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=True)

    __table_args__ = (
        CheckConstraint("dia_vencimiento_cuota >= 1 AND dia_vencimiento_cuota <= 28", name="configuracion_sistema_dia_vencimiento_check"),
        CheckConstraint("porcentaje_recargo_mora >= 0", name="configuracion_sistema_recargo_check"),
        CheckConstraint("porcentaje_descuento_familiar >= 0", name="configuracion_sistema_descuento_check"),
        CheckConstraint("umbral_asistencia_alerta >= 0 AND umbral_asistencia_alerta <= 100", name="configuracion_sistema_umbral_check"),
    )
