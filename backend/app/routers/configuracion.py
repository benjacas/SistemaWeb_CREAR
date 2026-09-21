from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.configuracion_sistema import ConfiguracionSistema
from app.schemas.configuracion import ConfiguracionOut
from app.core.deps import obtener_identidad_actual

router = APIRouter()


# Devuelve solo los campos institucionales que el frontend necesita — nunca
# mp_access_token/kapso_api_key (internos del backend, no se exponen en
# ninguna respuesta de API, ni siquiera acá — ver comentarios en el modelo).
@router.get("/configuracion", response_model=ConfiguracionOut)
def obtener_configuracion(identidad: dict = Depends(obtener_identidad_actual), db: Session = Depends(get_db)):
    config = db.query(ConfiguracionSistema).first()
    return config
