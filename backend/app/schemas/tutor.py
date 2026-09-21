from pydantic import BaseModel


class TutorOut(BaseModel):
    nombre: str
    apellido: str
    email: str
    telefono: str | None

    class Config:
        from_attributes = True


class TutorUpdate(BaseModel):
    email: str | None = None
    telefono: str | None = None
