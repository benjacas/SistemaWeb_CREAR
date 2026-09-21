from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.cargo import Cargo
from app.schemas.cargo import CargoOut, PagoOut
from app.core.deps import obtener_identidad_actual, verificar_acceso_a_alumno

router = APIRouter()


@router.get("/alumnos/{alumno_id}/cargos", response_model=list[CargoOut])
def listar_cargos(
    alumno_id: str,
    db: Session = Depends(get_db),
    identidad: dict = Depends(obtener_identidad_actual),
):
    verificar_acceso_a_alumno(alumno_id, identidad, db)
    cargos = (
        db.query(Cargo)
        .filter(Cargo.alumno_id == alumno_id)
        .order_by(Cargo.fecha_generacion.desc())
        .all()
    )
    return [
        CargoOut(
            id=c.id,
            concepto=c.concepto_cobro.nombre,
            periodo=c.periodo,
            monto_final=float(c.monto_final),
            descuento_aplicado=float(c.descuento_aplicado or 0),
            recargo_aplicado=float(c.recargo_aplicado or 0),
            estado=c.estado.value,
            fecha_vencimiento=c.fecha_vencimiento,
            fecha_generacion=c.fecha_generacion,
            pagos=[
                PagoOut(
                    id=p.id, fecha_pago=p.fecha_pago, monto=float(p.monto),
                    metodo=p.metodo.value,
                    comprobante_numero=f"{p.comprobante.anio}-{p.comprobante.numero:05d}" if p.comprobante else None,
                )
                for p in c.pagos
            ],
        )
        for c in cargos
    ]
