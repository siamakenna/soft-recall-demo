import bedroomImg from "@/assets/scene-bedroom.jpg";
import phoneImg from "@/assets/scene-phone.jpg";
import hallwayImg from "@/assets/scene-hallway.jpg";
import kitchenImg from "@/assets/scene-kitchen.jpg";
import bathroomImg from "@/assets/scene-bathroom.jpg";
import type { RoomId, SceneId } from "../state";

export const SCENE_IMG: Record<SceneId, string> = {
  bedroom: bedroomImg,
  hallway: hallwayImg,
  kitchen: kitchenImg,
  bathroom: bathroomImg,
  phone: phoneImg,
  frontdoor: hallwayImg,
};

export const ROOM_LABEL: Record<RoomId, string> = {
  bedroom: "Bedroom",
  hallway: "Hallway",
  kitchen: "Kitchen",
  bathroom: "Bathroom",
};

export const ADJACENCY: Record<RoomId, RoomId[]> = {
  bedroom: ["hallway"],
  hallway: ["bedroom", "kitchen", "bathroom"],
  kitchen: ["hallway"],
  bathroom: ["hallway"],
};

export function roomEnterLine(room: RoomId): string {
  switch (room) {
    case "bedroom": return "The bed, still warm on one side.";
    case "hallway": return "A short hallway. Coat hook, front door, two rooms to either side.";
    case "kitchen": return "Kitchen light. The morning has a smell here.";
    case "bathroom": return "Cold tile. The tap drips once, then stops.";
  }
}
