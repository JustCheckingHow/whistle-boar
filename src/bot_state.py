from dataclasses import dataclass
from typing import Literal


@dataclass
class AnimalUpdate:
    animal_type: str = None
    location_lat: float = None
    location_lon: float = None
    behaviour: str = None
    image: str = None

    def is_done(self) -> bool:
        for attr in [
            self.animal_type,
            self.location_lat,
            self.location_lon,
            self.behaviour,
            self.image
        ]:
            if attr is None:
                return False
        return True

    def reset(self):
        self.animal_type = None
        self.location_lat = None
        self.location_lon = None
        self.behaviour = None
        self.image = None


@dataclass
class BotState:
    INFO_SHARED: bool = False
    PHOTO_RECEIVED: bool = False
    LOCATION_RECEIVED: bool = False
    BEHAVIOUR_RECEIVED: bool = False
    TYPE_RECEIVED: bool = False
    STATE: Literal["INTRO", "PHOTO", "LOCATION", "BEHAVIOUR", "TYPE"] = "INTRO"

    def next_state(self):
        if not self.INFO_SHARED:
            self.STATE = "INTRO"
            return self.intro_message()
        if not self.PHOTO_RECEIVED:
            self.STATE = "PHOTO"
            return "Jeśli masz zdjęcie, załaduj je teraz."
        if not self.LOCATION_RECEIVED:
            self.STATE = "LOCATION"
            return "Proszę podać lokalizację obserwacji"
        if not self.BEHAVIOUR_RECEIVED:
            self.STATE = "BEHAVIOUR"
            return "Jak zachowywało się zwierzę?"
        if not self.TYPE_RECEIVED:
            self.STATE = "TYPE"
            return "Czy wiesz jaki to gatunek? Jeśli tak, to jaki?"

        self.reset()
        return ("Dziękujemy za zgłoszenie!\n"
                "Aby zgłosić kolejne zwierzę, wpisz /start")

    def intro_message(self) -> str:
        return """
        *Witaj w lokalizatorze fauny* \n
        Co zobaczyłeś/zobaczyłaś dzisiaj na szlaku? \n
        Możesz podzielić się swoją obserwacją telefonicznie \n 
        pod numerem: 732 070 705
        """

    def reset(self):
        self.PHOTO_RECEIVED = False
        self.LOCATION_RECEIVED = False
        self.BEHAVIOUR_RECEIVED = False
        self.TYPE_RECEIVED = False
        self.INFO_SHARED = False