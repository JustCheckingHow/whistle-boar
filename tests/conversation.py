import requests
import re
import time

HOST = "http://localhost:8000"

def extract_next_action(xml):
    # the next action is given in the form of `action="X"`
    if "Hangup" in xml:
        return "hangup"
    try:
        return re.search(r'action="(.+?)"', xml)[1]
    except TypeError:
        print(xml)

def extract_speech_result(xml):
    # the speech result is given in the form of `<Say (...)>...</Say>`
    return re.search(r'<Say.*?>(.+?)</Say>', xml)[1]

import contextlib
if __name__ == "__main__":
    # initialize the conversation
    text = input("Start conversation [/menu]: ")
    s = requests.Session()
    r = s.post(f"{HOST}/voice", data={"SpeechResult": text})

    with open("prerecorded.txt", "w") as f:
        f.write(text + "\n")

    while True:
        # get the next action
        action = extract_next_action(r.text)
        if action == "hangup":
            break
        with contextlib.suppress(TypeError):
            response = extract_speech_result(r.text)
            print(f"Assistant: {response}")
        if "Gather" in r.text:
            # get the next text to say
            text = input(f"Say something [/{action}]: ")
            with open("prerecorded.txt", "a") as f:
                f.write(text + "\n")
            r = s.post(f"{HOST}/{action}", data={"SpeechResult": text})
        else:
            r = s.post(f"{HOST}/{action}")

        time.sleep(0.5)
