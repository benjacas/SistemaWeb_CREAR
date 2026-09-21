"""Uso único — les pone contraseña a los tutores de prueba ya cargados por
cargar_datos_reales.py. Se corre una vez y listo, no queda como parte del
flujo normal (no lo vuelvas a correr salvo que quieras resetear estas
contraseñas de desarrollo).

Uso: docker compose exec api python -m app.asignar_passwords_prueba

Credenciales resultantes documentadas en Claude.md, "Datos de prueba
disponibles" — son de desarrollo únicamente, nunca las de un despliegue real.
"""
from app.db.session import SessionLocal
from app.models.padre_tutor import PadreTutor
from app.gestion_datos import establecer_password

db = SessionLocal()

marcela = db.query(PadreTutor).filter_by(email="marcela.gomez@example.com").first()
diego = db.query(PadreTutor).filter_by(email="diego.torres@example.com").first()

if marcela is None or diego is None:
    raise SystemExit("Falta correr antes app.cargar_datos_reales — no están Marcela/Diego en la base.")

establecer_password(db, PadreTutor, marcela.id, "prueba123")
establecer_password(db, PadreTutor, diego.id, "prueba123")

print("Listo — Marcela y Diego ya tienen password_hash (contraseña de desarrollo: prueba123)")
db.close()
