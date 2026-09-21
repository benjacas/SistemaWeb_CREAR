from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verificar_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


# Simplificación consciente: un solo access token de 24hs, sin refresh
# token. Ver Claude.md — rotación de refresh tokens es un esfuerzo aparte
# que no aporta valor proporcional al alcance de este proyecto.
def crear_token(datos: dict, expira_minutos: int = 60 * 24) -> str:
    payload = datos.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=expira_minutos)
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def decodificar_token(token: str) -> dict:
    return jwt.decode(token, settings.secret_key, algorithms=["HS256"])
