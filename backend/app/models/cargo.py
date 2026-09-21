import enum

from sqlalchemy import Column, String, Text, Integer, Date, Numeric, ForeignKey, Enum, Index, CheckConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class EstadoCargo(str, enum.Enum):
    pendiente = "pendiente"
    pagado = "pagado"
    parcial = "parcial"
    # NUEVO — no estaba en la base original. Se agregó para el flujo de
    # Mercado Pago: representa "ya se generó el pago pero todavía no llegó
    # o no se confirmó el webhook" (ver hooks/useMisEntradas.js del portal,
    # que simula esto localmente con confirmarCompra()).
    pago_en_revision = "pago_en_revision"


class Cargo(Base):
    __tablename__ = "cargo"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    alumno_id = Column(UUID(as_uuid=True), ForeignKey("alumno.id"), nullable=False)
    concepto_cobro_id = Column(UUID(as_uuid=True), ForeignKey("concepto_cobro.id"), nullable=False)
    descripcion = Column(Text, nullable=True)
    periodo = Column(String, nullable=True)
    monto_original = Column(Numeric, nullable=False)
    # nullable=True (no False) a propósito: el original no las marca NOT
    # NULL, y el propio CHECK ("IS NULL OR >= 0") solo tiene sentido si
    # pueden ser NULL — corregido en la Fase B6, estaban en nullable=False.
    descuento_aplicado = Column(Numeric, nullable=True, server_default=text("0.00"))
    recargo_aplicado = Column(Numeric, nullable=True, server_default=text("0.00"))
    monto_final = Column(Numeric, nullable=False)
    fecha_generacion = Column(Date, nullable=False, server_default=text("CURRENT_DATE"))
    fecha_vencimiento = Column(Date, nullable=True)
    # server_default (no default= de Python) — ver Claude.md / SCHEMA.md,
    # "default vs server_default en enums".
    estado = Column(Enum(EstadoCargo, name="estado_cargo"), nullable=False, server_default=text("'pendiente'"))
    generado_por = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=True)
    grupo_clase_id = Column(UUID(as_uuid=True), ForeignKey("grupo_clase.id"), nullable=True)

    # ── Columnas NUEVAS, propuestas, SIN CONFIRMAR con la compañera ──────
    # Reusan `cargo` para entradas de evento (butacas) en vez de crear una
    # tabla `entrada` aparte — a validar si `cargo` ya tiene demasiada
    # lógica atada a "cuota mensual" que no aplica acá (ver Claude.md /
    # backend/SCHEMA.md, sección Eventos).
    evento_institucional_id = Column(UUID(as_uuid=True), ForeignKey("evento_institucional.id"), nullable=True)
    fila = Column(String, nullable=True)
    columna = Column(Integer, nullable=True)
    vestuario_evento_id = Column(UUID(as_uuid=True), ForeignKey("vestuario_evento.id"), nullable=True)
    # ───────────────────────────────────────────────────────────────────

    concepto_cobro = relationship("ConceptoCobro")
    pagos = relationship("Pago", back_populates="cargo")

    __table_args__ = (
        # Anti-sobreventa de butacas: evita que dos cargos "vivos" reserven
        # la misma butaca del mismo evento. Índice parcial (solo aplica a
        # estados donde la butaca sigue "tomada") — revisar a mano que la
        # migración autogenerada lo haya creado bien, autogenerate no
        # siempre entiende índices parciales con WHERE.
        Index(
            "cargo_butaca_activa_unica",
            "evento_institucional_id", "fila", "columna",
            unique=True,
            postgresql_where=text("estado IN ('pendiente', 'pago_en_revision', 'pagado')"),
        ),
        CheckConstraint("monto_original > 0", name="cargo_monto_original_check"),
        CheckConstraint("descuento_aplicado IS NULL OR descuento_aplicado >= 0", name="cargo_descuento_aplicado_check"),
        CheckConstraint("recargo_aplicado IS NULL OR recargo_aplicado >= 0", name="cargo_recargo_aplicado_check"),
        CheckConstraint("monto_final >= 0", name="cargo_monto_final_check"),
    )
