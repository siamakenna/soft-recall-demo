import type { MemoryEntry, RoomId } from "../state";

export type MorningBeat = {
  id: string;
  text: string;
  choices: { id: string; label: string; response: string }[];
};

export type RoomStory = {
  id: string;
  room: RoomId;
  title: string;
  objectLabel: string;
  beats: MorningBeat[];
  memory: MemoryEntry;
};

// Choices rejoin at the next beat. These IDs are separate from routine task IDs.
export const ROOM_STORIES: Record<RoomId, RoomStory> = {
  bedroom: {
    id: "morning-bedroom",
    room: "bedroom",
    title: "The unfinished square",
    objectLabel: "Quilt at the foot of the bed",
    beats: [
      {
        id: "morning-bedroom-hem",
        text: "A square of the quilt hangs over the bed, its blue washed almost to white. I find a loose thread where two pieces meet. Last night my heel must have caught it. The rest of the room can wait at the edge of my sight while I decide what to do with this small unravelling.",
        choices: [
          { id: "tuck", label: "Tuck the thread under the hem.", response: "I ease it into the fold with my thumbnail. The join stays a little crooked." },
          { id: "leave", label: "Leave the thread where I can find it.", response: "I lay it flat against the blue. Later, I will know where to begin." },
        ],
      },
      {
        id: "morning-bedroom-square",
        text: "Beside the blue is a square with tiny green checks. I used to think all the pieces came from clothes, that somewhere there had been a person wearing each part of this bed. This one might only be shop fabric. I turn its corner over, looking for an old seam that would make my story true.",
        choices: [
          { id: "search", label: "Look closely for the old seam.", response: "There is only the stitching that holds it here. I stop asking the cloth for proof." },
          { id: "imagine", label: "Picture the shirt it could have been.", response: "In my head it has rolled sleeves. I let it be an invented shirt, still green." },
        ],
      },
      {
        id: "morning-bedroom-weight",
        text: "The quilt settles across my wrist with more weight than I expect. Underneath, the sheet is pale and creased into little tributaries. One runs toward the place my shoulder left. I have spent the night making a shape here without seeing it happen. In daylight, I can follow the whole uneven outline with one finger.",
        choices: [
          { id: "smooth", label: "Smooth one crease with my palm.", response: "A narrow patch lies flat. Around it, the other creases keep their branching paths." },
          { id: "trace", label: "Trace the outline I left.", response: "My finger reaches the edge of the pillow. It is a smaller journey than it looked." },
        ],
      },
      {
        id: "morning-bedroom-fold",
        text: "I gather the quilt's edge. For a moment I picture the bed made properly, all its squares lined up for nobody in particular. Then I notice the underside, where someone changed thread halfway through a row. White stitches become yellow without an apology. I hold that little change between my fingers before choosing a fold.",
        choices: [
          { id: "square", label: "Line up the corners.", response: "I match one corner to another. The middle rises in a soft, imperfect ridge." },
          { id: "loose", label: "Fold it loosely across the foot.", response: "I leave a generous fold, wide enough to get my feet beneath when I come back." },
        ],
      },
      {
        id: "morning-bedroom-return",
        text: "The green checks are still visible. So is a short row of yellow stitches near the fold. From here, the bed looks less like something abandoned and more like something I will return to. I rest my hand on it once more. There is no need to give the whole morning a shape before I lift my hand.",
        choices: [
          { id: "keep-image", label: "Keep the green square in mind.", response: "I look until I can picture the checks with my eyes lowered. Then I let go." },
          { id: "keep-touch", label: "Keep the weight against my palm.", response: "I press lightly, feeling the layers together. My hand comes away warm." },
        ],
      },
    ],
    memory: {
      section: "Fragments",
      title: "Quilt: the green square",
      body: "Green checks beside faded blue. On the underside, white stitches turn yellow halfway through a row. I held the change between my fingers. The quilt is folded at the foot of the bed, with the green square still showing.",
      room: "bedroom",
    },
  },
  kitchen: {
    id: "morning-kitchen",
    room: "kitchen",
    title: "A place at the table",
    objectLabel: "Cup beside the window",
    beats: [
      {
        id: "morning-kitchen-handle",
        text: "An empty cup stands beside the kitchen window. Its handle leans a little higher on one side, something I only notice when I look straight at it. There is a pale ring inside from another morning. I curl my fingers near the handle without lifting it, trying the shape of a pause before taking one.",
        choices: [
          { id: "lift", label: "Lift it by the uneven handle.", response: "My finger finds its usual place beneath the bend. I set the cup down again." },
          { id: "turn", label: "Turn it until the handle faces me.", response: "The cup travels a quarter circle. Its small invitation points toward my chair." },
        ],
      },
      {
        id: "morning-kitchen-ring",
        text: "The ring inside is thinner near the rim, as if yesterday's tea rose up there and thought better of it. I could wash it away in a moment. Instead I study the line. I remember sitting here once with both hands around this cup while a rectangle of sunlight moved across the opposite chair.",
        choices: [
          { id: "seat", label: "Remember where I was sitting.", response: "Near the table's corner, one foot tucked underneath me. I uncurl my toes now." },
          { id: "light", label: "Remember the light on the empty chair.", response: "It reached the backrest before I noticed. I had stayed longer than I meant to." },
        ],
      },
      {
        id: "morning-kitchen-chair",
        text: "The opposite chair is pushed in, but not all the way. A strip of its seat shows beneath the table. I used to straighten both chairs before leaving, even when I had only used one. This morning the gap looks like room for someone's knees. I put my hand on the backrest and consider its angle.",
        choices: [
          { id: "align", label: "Set it square with the table.", response: "I move it a fraction. There is still space beneath the edge, still a place to sit." },
          { id: "open", label: "Turn it slightly toward my chair.", response: "Now the two seats face each other a little. I leave the table between them." },
        ],
      },
      {
        id: "morning-kitchen-company",
        text: "I picture Ana here, turning a cup by its handle while she searches for the beginning of a story. In the version I picture, she gets distracted by something on the windowsill and starts there instead. I look toward the same patch of light. There are several things I could tell her that do not begin with how I am.",
        choices: [
          { id: "cup-story", label: "Imagine telling her about the crooked handle.", response: "I would hold it up for her to see. In my imagined visit, she turns hers to compare." },
          { id: "ask-story", label: "Imagine asking what she saw on her way.", response: "I leave the answer unwritten. The chair across from me has room for a story I don't know." },
        ],
      },
      {
        id: "morning-kitchen-place",
        text: "I bring my attention back to the cup. A thin white reflection rests inside it, untouched by the old tea ring. The chair, the window, the small uneven handle: nothing here asks me to finish the conversation I imagined. I move the cup clear of the table's edge and leave a little space beside it.",
        choices: [
          { id: "sit", label: "Sit with the space for a moment.", response: "I settle into my chair. My hands rest on the table without reaching for anything." },
          { id: "stand", label: "Leave the place ready for later.", response: "I stand with one hand on the chair. The cup stays well inside the edge." },
        ],
      },
    ],
    memory: {
      section: "Reflections",
      title: "Cup: a place for company",
      body: "An uneven handle, yesterday's pale tea ring, a chair across the table. I imagined a conversation with Ana that could begin with something by the window. I moved the empty cup away from the edge and left space beside it. No message was sent.",
      room: "kitchen",
    },
  },
  bathroom: {
    id: "morning-bathroom",
    room: "bathroom",
    title: "The narrow stripe",
    objectLabel: "Striped hand towel",
    beats: [
      {
        id: "morning-bathroom-stripe",
        text: "The hand towel has a narrow red stripe near its hem. Folded over the rail, it looks almost straight; at the corner, the weaving pulls it sideways. I catch myself trying to correct it with my eyes. Up close, the red is made of separate threads, each disappearing under a row of white.",
        choices: [
          { id: "follow", label: "Follow one red thread with my fingertip.", response: "It slips beneath the white and returns. I lose it once, then find another." },
          { id: "whole", label: "Step back and look at the whole stripe.", response: "From half a step away, the threads become a line again. The crooked corner belongs to it." },
        ],
      },
      {
        id: "morning-bathroom-loops",
        text: "I lift a corner into my palm. The loops are flattened in the middle, soft where hands keep finding the same place. Along the border they are still brisk and almost new. I rub the two textures with my thumb. I have owned this towel long enough to have changed it without ever deciding to.",
        choices: [
          { id: "middle", label: "Hold the softened middle.", response: "It folds easily into my hand. There is a faint hollow where my thumb rests." },
          { id: "border", label: "Feel the firmer border.", response: "The edge keeps its shape against my fingers. I turn it once, feeling the raised stitching." },
        ],
      },
      {
        id: "morning-bathroom-tag",
        text: "A little label hides beneath the fold. Most of its lettering has washed away, leaving a few grey marks and one complete corner. I remember the towel stiff from the shop, folded around cardboard. I cannot remember buying it. The first picture I have is of hanging it here, with the label facing the wall.",
        choices: [
          { id: "read", label: "Try to read the remaining marks.", response: "I can make out part of a letter, nothing more. I lower the label without inventing the rest." },
          { id: "first-picture", label: "Stay with the picture of hanging it here.", response: "My hands in the remembered picture are doing almost exactly this. I let that be the beginning." },
        ],
      },
      {
        id: "morning-bathroom-hang",
        text: "I drape the towel over the rail again. One end hangs lower. In the mirror's edge I can see my hands arranging it, close enough together to look as though they are holding something smaller. I stop watching the reflection and look down at what is actually between them: white cloth, red thread, a nearly vanished label.",
        choices: [
          { id: "even", label: "Bring the two ends level.", response: "I draw one end up until they meet. The stripe remains slightly crooked within the even fold." },
          { id: "reachable", label: "Leave one end easier to reach.", response: "I keep the nearer end lower. My hand will find it without reaching across the rail." },
        ],
      },
      {
        id: "morning-bathroom-release",
        text: "A loose white loop catches against my nail and lets go. I spread my fingers to check, then rest them against the towel once more. Beyond the basin, daylight rests on the tile in broad, faint squares. The stripe is only a stripe again. I can leave it here without taking my hands' work apart.",
        choices: [
          { id: "cloth", label: "Notice where the cloth warmed under my hand.", response: "For a moment I can tell the place I touched from the cooler border. Then I lift my palm." },
          { id: "tile", label: "Let my eyes move to the light on the tile.", response: "The squares blur at their edges. I look away from the towel and let it hang." },
        ],
      },
    ],
    memory: {
      section: "Fragments",
      title: "Towel: a stripe of red",
      body: "The red stripe bends at one corner. The middle is softer than the border, and the label has almost washed blank. I remember hanging it here more clearly than buying it. I put it back on the rail and let go of the cloth.",
      room: "bathroom",
    },
  },
  hallway: {
    id: "morning-hallway",
    room: "hallway",
    title: "Inside the cuff",
    objectLabel: "Mended coat cuff",
    beats: [
      {
        id: "morning-hallway-cuff",
        text: "At the coat's cuff, a small repair nearly disappears into the weave. I turn the edge outward to see it better. The thread is a shade darker than the cloth, gathered into five uneven stitches. From the doorway I would never notice. Here, with the sleeve held close, I can see where the needle went back twice.",
        choices: [
          { id: "touch", label: "Feel the doubled stitch.", response: "It rises like a tiny knot beneath my thumb. I pass over it carefully." },
          { id: "look", label: "Hold the repair toward the light.", response: "The darker thread separates from the weave. Five stitches, one place worked over again." },
        ],
      },
      {
        id: "morning-hallway-mending",
        text: "I remember mending this at the table with the sleeve spread over my knee. The thread kept slipping out of the needle. I cut a fresh end, wet it between my lips, tried again. I had forgotten the repair itself, but not that narrow, stubborn task of persuading two small things to meet.",
        choices: [
          { id: "hands", label: "Remember my hands doing the work.", response: "One held the needle still while the other brought the thread closer. Eventually, it went through." },
          { id: "finished", label: "Remember putting the needle away.", response: "I folded the remaining thread around its card. The sleeve was ready before the evening was over." },
        ],
      },
      {
        id: "morning-hallway-lining",
        text: "The lining slips against the back of my fingers. Near the wrist it has faded more than the rest, a lighter crescent where my hand passes through. I think of all the ordinary returns that made it: groceries against my hip, rain on my sleeves, an evening when I brought nothing home but the coat itself.",
        choices: [
          { id: "rain", label: "Stay with the rainy return.", response: "I picture dark spots drying slowly across the shoulders, my hands still cool inside the sleeves." },
          { id: "empty", label: "Stay with the evening I carried nothing.", response: "I remember having both hands free. I took the coat off slowly, one sleeve and then the other." },
        ],
      },
      {
        id: "morning-hallway-outside",
        text: "A thin band of light lies at the bottom of the front door. From this angle it stops at my toes. I keep the cuff in my hand and picture coming back across that line later. Whatever happens outside, I will have to find this sleeve again. The repaired place will sit just inside my wrist.",
        choices: [
          { id: "return", label: "Picture my hand finding the cuff on returning.", response: "My thumb catches the small ridge of thread. In the picture, I recognise it before I look." },
          { id: "present", label: "Feel the cuff here, before going anywhere.", response: "I fold the edge over my fingers. The imagined afternoon can wait beyond the door." },
        ],
      },
      {
        id: "morning-hallway-release",
        text: "I turn the cuff right side out. The repair disappears again unless I know where to look. For a moment I keep the sleeve balanced on my open palm, neither putting the coat on nor putting it away. Then I lower my hand. The small darker stitches belong to the morning now, whichever way I turn next.",
        choices: [
          { id: "keep-detail", label: "Keep the five stitches in mind.", response: "I give them one last glance. The doubled stitch makes them easy to find." },
          { id: "look-ahead", label: "Look toward the rest of the hallway.", response: "I let my eyes travel past the coat. There is room to turn back toward the other rooms." },
        ],
      },
    ],
    memory: {
      section: "Reflections",
      title: "Coat: five darker stitches",
      body: "Inside the cuff, five darker stitches hold an old repair. One doubles back. I remembered threading the needle at the table and felt the faded lining against my fingers. I turned the cuff right side out; the repair is still there, just out of sight.",
      room: "hallway",
    },
  },
};

export const CUTSCENE_COPY: Record<
  "waking" | "note" | "corridor" | "tea" | "threshold" | "clear-morning",
  { title: string; lines: string[] }
> = {
  waking: {
    title: "Before the room has edges",
    lines: [
      "Light lies across the sheet in a pale, uneven band. I move one foot beneath it. The fabric lifts, and the band breaks over my toes.",
      "For a moment I keep my eyes on the ceiling. Near the window, its white thins into grey. My hand finds the warm hollow beside the pillow.",
      "The phone is dark on the nightstand. The glasses wait by the window. I let both be where they are while I find the floor.",
      "I sit up. The quilt slips toward my knees, gathering its colours into folds. Across the room, the day's first objects wait where I left them.",
      "Nothing asks for the whole morning yet. The room gives me one edge, then another.",
    ],
  },
  note: {
    title: "A place to catch the eye",
    lines: [
      "The paper opens along a fold that has been opened before. One step. Then the next. The words are plain enough to hold in my hand.",
      "I carry it to the door. The coat hangs there with one sleeve turned inside out, ready to catch on a wrist. I set the note where the light will find it.",
      "The paper leans against the skirting board instead of disappearing into a pocket. It makes a small pale shape beside the shoes.",
      "Back in the bedroom, the pillow keeps its hollow. The note has moved, and the room has made space for that small decision.",
      "When I look back, I can still see where I put it. That is enough to leave the room.",
    ],
  },
  corridor: {
    title: "The distance between rooms",
    lines: [
      "The bedroom door eases shut behind me. The hallway is shorter than it looked from the bed, though the front door is still at the far end.",
      "On either side, the apartment offers its ordinary turns: warm light toward the kitchen, a cooler square toward the bathroom.",
      "The floorboards change colour where the morning reaches them. I follow the seam until it becomes a direction.",
      "I keep one hand free. The rooms are still here when I look back, and the next one does not need to be chosen all at once.",
      "Somewhere ahead, a kettle-shaped silence waits. Behind the other door, water keeps its colder promise.",
    ],
  },
  tea: {
    title: "What the cup keeps",
    lines: [
      "The last mouthful is gone. I tilt the cup and watch a bright crescent slide along the glaze. Its warmth has reached the roots of my fingers.",
      "Beyond the window, a patch of sky fits between the neighbouring roofs. I look at it over the rim, though there is nothing left to drink.",
      "The table has a faint tide mark beneath the cup. My thumb follows it once, then stops at the dry wood.",
      "I set the cup down. My hands remain curved for a moment around the space it occupied. Then I open them against the table.",
      "The room does not become solved. It becomes warm enough to stand in.",
    ],
  },
  threshold: {
    title: "At the edge of the morning",
    lines: [
      "The front door fills my view, paint worn smooth beside the handle. I stand close enough to see a brush mark running beneath the newer coat.",
      "Light beneath the door reaches the edge of my foot. I shift my weight, and a little more of it appears on the floor behind me.",
      "The key ring rests in my palm. Two small teeth, a loop of blue thread, the weight of a thing that knows its own lock.",
      "I rest my hand near the handle without turning it. Behind me are the rooms I have moved through. I take one more moment before choosing what comes next.",
      "The morning has not narrowed to one right answer. The handle waits inside the answer I can carry.",
    ],
  },
  "clear-morning": {
    title: "A morning held in both hands",
    lines: [
      "The rooms line up behind me: the bed's warm hollow, the kettle's empty cup, the bathroom light, the hallway coat.",
      "I can name where each thing is because I gave it a place. The note catches the corner of my eye beside the door.",
      "For once, the list does not arrive as a wall. It arrives as a handful of objects, each one with an edge.",
      "I breathe in the quiet between them. The lock, the handle, the light under the door: three small pieces of a way through.",
      "I turn toward the choice without needing to make it smaller first.",
    ],
  },
};
