import json
from pathlib import Path

STATE_FILE = Path(
    "data/workflow_states.json"
)


def load_states():

    if not STATE_FILE.exists():
        return []

    with open(
        STATE_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        return json.load(file)


def save_states(
    states
):

    with open(
        STATE_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            states,
            file,
            indent=4,
            ensure_ascii=False
        )
        
def save_state(
    state_dict
):

    states = load_states()

    states.append(state_dict)

    save_states(states)
 
   
def get_all_states():
    
    return load_states()