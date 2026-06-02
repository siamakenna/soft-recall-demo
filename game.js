const tasks = [
  { id: "glasses", label: "Find glasses" },
  { id: "tea", label: "Make tea" },
  { id: "medication", label: "Take medication" },
  { id: "photo", label: "Look at the photo" },
  { id: "phone", label: "Call someone familiar" },
  { id: "door", label: "Leave for the appointment" }
];

const objectCopy = {
  glasses: {
    clear: "glasses",
    soft: "small lenses",
    supported: "glasses - bedside",
    line: "The glasses are beside the bed, folded like they were waiting.",
    softLine: "Two bright circles. Useful. Yours, probably.",
    detail: "The frames are cool at first, then familiar against your face. The room arrives one edge at a time.",
    reflection: "glasses"
  },
  tea: {
    clear: "kettle",
    soft: "warm thing",
    supported: "kettle - tea first",
    line: "The kettle clicks softly. Tea makes the room feel named again.",
    softLine: "Steam rises before the word for it arrives.",
    detail: "The mug is warm in both hands. Some routines remember the body before the mind finds the word.",
    reflection: "tea"
  },
  medication: {
    clear: "medication",
    soft: "morning bottle",
    supported: "medicine - after tea",
    line: "The label is clear today. One tablet after tea.",
    softLine: "The bottle has instructions. The note helps them stay still.",
    detail: "The pill organizer makes the decision smaller: today has a place, and the place is already marked.",
    reflection: "medication"
  },
  photo: {
    clear: "photo",
    soft: "someone loved",
    supported: "Mom - beach, 2018",
    line: "Mom at the beach, 2018. Mango tea. Blue towel. Wind in her hair.",
    softLine: "She is important. The name is close, but not in reach.",
    detail: "The photo is familiar before the name arrives. The feeling gets there first and waits kindly.",
    reflection: "photo"
  },
  phone: {
    clear: "phone",
    soft: "voice box",
    supported: "phone - call Mom",
    line: "The call connects. A familiar voice says, 'Take your time.'",
    softLine: "A voice arrives. The room loosens around it.",
    detail: "The contact card has a photo now. A voice can be a landmark when the room feels too wide.",
    reflection: "phone"
  },
  door: {
    clear: "door",
    soft: "outside",
    supported: "door - appointment",
    line: "The appointment card is in your pocket. The hallway is only a hallway.",
    softLine: "The outside waits. The note says where it begins.",
    detail: "The door is not a test. It is a transition made gentler by keys, card, phone, glasses, breath.",
    reflection: "door"
  },
  note: {
    clear: "note",
    soft: "anchor",
    supported: "morning note",
    line: "A note in your own handwriting: glasses, tea, medicine, call, appointment.",
    softLine: "The paper remembers without asking you to apologize.",
    detail: "The note does not fix the morning. It gives the morning a handle.",
    reflection: "note"
  }
};

const reflections = {
  glasses: {
    title: "Perception and orientation",
    poetic: "Clarity can begin with the senses. Better light, glasses, and familiar placement help the room become readable before memory has to work so hard.",
    plain: "Vision support and consistent object placement can make orientation easier and reduce stress."
  },
  tea: {
    title: "Routine and embodied memory",
    poetic: "A routine can live in the hands: water, switch, cup, warmth. The body sometimes carries a sequence when words arrive late.",
    plain: "Familiar routines can help people move through tasks even when language or recall is harder."
  },
  medication: {
    title: "External support",
    poetic: "The organizer is not a correction. It is care made visible, turning a fragile instruction into something the room can hold.",
    plain: "Medication reminders and organizers can support independence and reduce cognitive load."
  },
  photo: {
    title: "Personhood and identity",
    poetic: "A name may blur without erasing the relationship. Emotional memory can remain present in texture, warmth, and recognition.",
    plain: "Forgetting a name does not erase identity, love, or personhood."
  },
  phone: {
    title: "Social grounding",
    poetic: "A familiar voice can steady the day. Connection offers orientation without turning confusion into a performance.",
    plain: "Calm, familiar communication can reduce distress and help someone feel oriented."
  },
  door: {
    title: "Supported autonomy",
    poetic: "Leaving is easier when the route is kind: checklist, card, voice, keys. Support can protect independence instead of replacing it.",
    plain: "Environmental supports can help people keep choice and independence."
  },
  note: {
    title: "Environmental cueing",
    poetic: "The note remembers quietly. It lowers the demand on memory, leaving more room for attention, dignity, and breath.",
    plain: "Notes and checklists can reduce cognitive load without blaming the person."
  },
  general: {
    title: "Dignity by design",
    poetic: "The game does not cure the morning. It asks what a room can do when someone needs gentler ways to move through it.",
    plain: "The design focuses on dignity, routine, and practical support rather than a cure."
  }
};

const supportCopy = {
  label: {
    log: "You add simple labels where the morning keeps thinning.",
    caption: "Labels placed: key objects become easier to distinguish.",
    prompt: "Follow the label for the next step."
  },
  checklist: {
    log: "You open the large-print checklist. The next step has fewer edges.",
    caption: "Checklist open: the task is held outside of memory for a while.",
    prompt: "Use the checklist: "
  },
  voice: {
    log: "A familiar voice says, 'Take your time. I am right here with you.'",
    caption: "The voice does not solve the morning. It makes the morning less lonely.",
    prompt: "A familiar voice steadies the room."
  }
};

const misclicks = [
  "The object is familiar, but not the next step.",
  "A pause. The room waits with you.",
  "This matters, just not yet.",
  "The task slips sideways for a moment.",
  "The room does not punish the pause.",
  "A familiar thing, slightly out of order."
];

const state = {
  started: false,
  completed: new Set(),
  support: 1,
  recall: 6,
  roomState: "clear",
  activeReflection: "general",
  misclickIndex: 0,
  supports: {
    label: false,
    checklist: false,
    voice: false
  },
  settings: {
    reducedMotion: false,
    plainLanguage: false,
    largeText: false,
    highContrast: false
  }
};

const els = {
  titleScreen: document.querySelector("#titleScreen"),
  gameScreen: document.querySelector("#gameScreen"),
  settingsPanel: document.querySelector("#settingsPanel"),
  supportModal: document.querySelector("#supportModal"),
  reflection: document.querySelector("#reflection"),
  ending: document.querySelector("#ending"),
  taskList: document.querySelector("#taskList"),
  currentPrompt: document.querySelector("#currentPrompt"),
  stateLabel: document.querySelector("#stateLabel"),
  checklistPanel: document.querySelector("#checklistPanel"),
  checklistPrompt: document.querySelector("#checklistPrompt"),
  journalLog: document.querySelector("#journalLog"),
  recallMeter: document.querySelector("#recallMeter"),
  supportMeter: document.querySelector("#supportMeter"),
  caption: document.querySelector("#caption"),
  room: document.querySelector("#room"),
  player: document.querySelector("#player"),
  reflectionTitle: document.querySelector("#reflectionTitle"),
  reflectionBody: document.querySelector("#reflectionBody")
};

function init() {
  document.querySelector("#startGame").addEventListener("click", startGame);
  document.querySelector("#openSettings").addEventListener("click", () => toggleSettings(true));
  document.querySelector("#closeSettings").addEventListener("click", () => toggleSettings(false));
  document.querySelector("#supportCue").addEventListener("click", openSupportChoices);
  document.querySelector("#closeSupport").addEventListener("click", closeSupportChoices);
  document.querySelector("#learnMore").addEventListener("click", showReflection);
  document.querySelector("#closeReflection").addEventListener("click", closeReflection);
  document.querySelector("#restart").addEventListener("click", restart);

  document.querySelectorAll("[data-support]").forEach((button) => {
    button.addEventListener("click", () => useSupport(button.dataset.support));
  });

  for (const key of Object.keys(state.settings)) {
    document.querySelector(`#${key}`).addEventListener("change", (event) => {
      state.settings[key] = event.target.checked;
      applySettings();
    });
  }

  document.querySelectorAll(".object").forEach((button) => {
    button.addEventListener("click", () => interact(button.dataset.object, button));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSupportChoices();
      closeReflection();
      toggleSettings(false);
    }
  });

  render();
}

function startGame() {
  state.started = true;
  els.titleScreen.classList.add("hidden");
  els.gameScreen.classList.remove("hidden");
  log("The morning begins in a low, warm light.");
  render();
}

function restart() {
  state.completed.clear();
  state.support = 1;
  state.recall = 6;
  state.roomState = "clear";
  state.activeReflection = "general";
  state.misclickIndex = 0;
  state.supports = { label: false, checklist: false, voice: false };
  els.journalLog.innerHTML = "";
  document.querySelectorAll(".object").forEach((object) => object.classList.remove("done", "helpful"));
  els.ending.classList.add("hidden");
  els.gameScreen.classList.remove("hidden");
  els.currentPrompt.textContent = promptFor("glasses");
  els.caption.textContent = "Click objects in the room. Labels may change as recall softens.";
  log("The morning begins again, softly.");
  render();
}

function toggleSettings(show) {
  els.settingsPanel.classList.toggle("hidden", !show);
  if (show) document.querySelector("#closeSettings").focus();
}

function applySettings() {
  document.body.classList.toggle("reduced-motion", state.settings.reducedMotion);
  document.body.classList.toggle("large-text", state.settings.largeText);
  document.body.classList.toggle("high-contrast", state.settings.highContrast);
  els.room.classList.toggle("reduced", state.settings.reducedMotion);
}

function interact(id, button) {
  movePlayer(button);

  if (id === "note") {
    state.support = Math.min(6, state.support + 0.5);
    state.recall = Math.min(6, state.recall + 0.4);
    state.activeReflection = objectCopy.note.reflection;
    log(state.completed.size > 0 ? objectCopy.note.detail : objectCopy.note.line);
    els.caption.textContent = objectCopy.note.softLine;
    render();
    return;
  }

  if (state.completed.has(id)) {
    showOptionalDetail(id);
    return;
  }

  const nextTask = getNextTask();
  if (!nextTask || nextTask.id !== id) {
    const response = misclicks[state.misclickIndex % misclicks.length];
    state.misclickIndex += 1;
    state.recall = Math.max(1, state.recall - 0.45);
    log(response);
    els.caption.textContent = "A small pause. The room stays gentle while the order comes back.";
    render();
    return;
  }

  state.completed.add(id);
  button.classList.add("done");
  state.activeReflection = objectCopy[id].reflection;

  const softened = state.roomState === "softened";
  const copy = objectCopy[id];
  log(softened ? copy.softLine : copy.line);
  state.recall = Math.max(1, state.recall - 0.9);

  if (id === "phone") {
    state.support = Math.min(6, state.support + 1.2);
    state.supports.voice = true;
  }

  if (id === "door") {
    finishGame();
    return;
  }

  const following = getNextTask();
  els.currentPrompt.textContent = following ? promptFor(following.id) : "The morning has softened enough to continue.";
  els.caption.textContent = softened ? "A word slips. The task remains possible." : "The apartment holds its shape for now.";
  render();
}

function showOptionalDetail(id) {
  const copy = objectCopy[id];
  state.activeReflection = copy.reflection;
  log(copy.detail);
  els.caption.textContent = copy.detail;
  renderHelpfulObject();
}

function promptFor(id) {
  const prompts = {
    glasses: "The apartment is quiet. Find your glasses.",
    tea: "Make tea before the rest of the morning gathers.",
    medication: "Take medication after tea.",
    photo: "Look at the photo near the table.",
    phone: "Call the familiar number.",
    door: "Leave for the appointment."
  };

  if (state.supports.checklist) {
    return `Next: ${prompts[id]}`;
  }

  return prompts[id];
}

function openSupportChoices() {
  els.supportModal.classList.remove("hidden");
  document.querySelector("[data-support]").focus();
}

function closeSupportChoices() {
  els.supportModal.classList.add("hidden");
}

function useSupport(type) {
  state.supports[type] = true;
  state.support = Math.min(6, state.support + 1);
  state.recall = Math.min(6, state.recall + (type === "voice" ? 0.8 : 0.55));
  state.activeReflection = type === "checklist" ? "note" : "general";

  const copy = supportCopy[type];
  log(copy.log);
  els.caption.textContent = copy.caption;

  const nextTask = getNextTask();
  if (nextTask) {
    els.currentPrompt.textContent = type === "checklist" ? `${copy.prompt}${promptFor(nextTask.id)}` : promptFor(nextTask.id);
  }

  closeSupportChoices();
  render();
}

function getNextTask() {
  return tasks.find((task) => !state.completed.has(task.id));
}

function render() {
  updateRoomState();
  renderTasks();
  updateMeters();
  updateLabels();
  updateSupportVisuals();
  renderHelpfulObject();
}

// Room state is based on both recall and support so support helps without acting like a cure.
function updateRoomState() {
  const supportUsed = Object.values(state.supports).some(Boolean);

  if (supportUsed || state.support >= 4 || (state.support >= 3 && state.recall >= 3)) {
    state.roomState = "supported";
  } else if (state.recall < 4 && state.support < 4) {
    state.roomState = "softened";
  } else {
    state.roomState = "clear";
  }

  els.room.dataset.state = state.roomState;
  els.stateLabel.textContent = {
    clear: "State: clear morning",
    softened: "State: softened recall",
    supported: "State: supported morning"
  }[state.roomState];
}

function updateLabels() {
  document.querySelectorAll(".object").forEach((button) => {
    const id = button.dataset.object;
    const copy = objectCopy[id];
    const label = state.roomState === "softened" && !state.supports.label
      ? copy.soft
      : state.roomState === "supported" || state.supports.label
        ? copy.supported
        : copy.clear;
    button.querySelector("span").textContent = label;
  });
}

function updateSupportVisuals() {
  els.room.classList.toggle("labels-on", state.supports.label);
  els.room.classList.toggle("checklist-on", state.supports.checklist);
  els.room.classList.toggle("voice-on", state.supports.voice);
  els.checklistPanel.classList.toggle("hidden", !state.supports.checklist);

  const nextTask = getNextTask();
  els.checklistPrompt.textContent = nextTask ? promptFor(nextTask.id).replace("Next: ", "") : "Leave through the door.";
}

function renderHelpfulObject() {
  document.querySelectorAll(".object").forEach((object) => object.classList.remove("helpful"));
  const nextTask = getNextTask();
  if (!nextTask) return;
  const nextObject = document.querySelector(`[data-object="${nextTask.id}"]`);
  if (nextObject && state.support >= 3) {
    nextObject.classList.add("helpful");
  }
}

function renderTasks() {
  els.taskList.innerHTML = "";
  const nextTask = getNextTask();

  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.textContent = task.label;
    if (state.completed.has(task.id)) item.classList.add("done");
    if (nextTask?.id === task.id) item.classList.add("current");
    els.taskList.append(item);
  });
}

function updateMeters() {
  els.recallMeter.style.width = `${(state.recall / 6) * 100}%`;
  els.supportMeter.style.width = `${(state.support / 6) * 100}%`;
}

function log(text) {
  const entry = document.createElement("p");
  entry.className = "entry";
  entry.textContent = text;
  els.journalLog.prepend(entry);
}

function movePlayer(target) {
  const roomRect = els.room.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const left = ((targetRect.left + targetRect.width / 2 - roomRect.left) / roomRect.width) * 100;
  const top = ((targetRect.top + targetRect.height / 2 - roomRect.top) / roomRect.height) * 100;
  els.player.style.left = `${left}%`;
  els.player.style.top = `${top}%`;
}

function showReflection() {
  const card = reflections[state.activeReflection] || reflections.general;
  els.reflectionTitle.textContent = card.title;
  els.reflectionBody.textContent = state.settings.plainLanguage ? card.plain : card.poetic;
  els.reflection.classList.remove("hidden");
  document.querySelector("#closeReflection").focus();
}

function closeReflection() {
  els.reflection.classList.add("hidden");
}

function finishGame() {
  els.gameScreen.classList.add("hidden");
  els.ending.classList.remove("hidden");
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

window.softRecallTrailer = {
  async run() {
    if (!state.started) {
      document.querySelector("#startGame").click();
    }

    await wait(2200);
    document.querySelector('[data-object="glasses"]').click();
    await wait(2600);
    document.querySelector('[data-object="tea"]').click();
    await wait(2200);
    document.querySelector("#supportCue").click();
    await wait(600);
    document.querySelector('[data-support="checklist"]').click();
    await wait(2300);
    document.querySelector('[data-object="medication"]').click();
    await wait(2100);
    document.querySelector("#supportCue").click();
    await wait(600);
    document.querySelector('[data-support="label"]').click();
    await wait(2400);
    document.querySelector('[data-object="photo"]').click();
    await wait(2500);
    document.querySelector('[data-object="phone"]').click();
    await wait(2200);
    document.querySelector('[data-object="photo"]').click();
    await wait(2300);
    document.querySelector('[data-object="door"]').click();
    await wait(7600);
  }
};

init();
