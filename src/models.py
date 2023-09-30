from typing import List
from typing import Optional
from sqlalchemy import ForeignKey
from sqlalchemy import String, Integer, Float
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy import create_engine
import os

class Base(DeclarativeBase):
    pass

class WildAnimalNotification(Base):
    __tablename__ = 'wild_animal_notification'

    id: Mapped[int] = mapped_column(String(36), primary_key=True)
    animal_type: Mapped[str] = mapped_column(String(255))
    location: Mapped[str] = mapped_column(String(255))
    location_lat: Mapped[float] = mapped_column(Float)
    location_lon: Mapped[float] = mapped_column(Float)
    behaviour: Mapped[str] = mapped_column(String(255))
    image: Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[str] = mapped_column(String(255))
    deleted_at: Mapped[Optional[str]] = mapped_column(String(255))

    def __repr__(self):
        return f"<WildAnimalNotification(id={self.id}, type={self.animal_type}>"
    
# create postgresql engine
engine = create_engine(f'postgresql://postgres:{os.environ["POSTGRES_PASSWORD"]}@postgres_chatter:5432/postgres')

if __name__ == "__main__":
    Base.metadata.create_all(engine)