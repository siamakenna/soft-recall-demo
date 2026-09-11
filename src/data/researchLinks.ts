export type ResearchSourceType = "NIH/NLM" | "NIA" | "NINDS" | "PubMed" | "PMC" | "DOI";

export interface ResearchLink {
  id: string;
  title: string;
  authorsOrAgency: string;
  year: number;
  sourceName: string;
  sourceType: ResearchSourceType;
  url: string;
  relatedMechanic: string;
  category:
    | "Memory confidence"
    | "Prospective memory"
    | "Cue use"
    | "Spatial navigation"
    | "External memory support";
  plainLanguageRelevance: string;
  claimBoundary: string;
  visibleInGame: boolean;
  verified: boolean;
}

export const researchLinks: ResearchLink[] = [
  {
    id: "nia-dementia-symptoms-progression",
    title: "What Is Dementia? Symptoms, Types, and Diagnosis",
    authorsOrAgency: "National Institute on Aging",
    year: 2022,
    sourceName: "National Institute on Aging",
    sourceType: "NIA",
    url: "https://www.nia.nih.gov/health/alzheimers-and-dementia/what-dementia-symptoms-types-and-diagnosis",
    relatedMechanic: "Memory Book review and noticing change over time",
    category: "External memory support",
    plainLanguageRelevance:
      "This official overview explains that dementia can affect memory, thinking, language, navigation, and everyday tasks, and that symptoms and causes vary.",
    claimBoundary:
      "The game cannot infer neurodegeneration, progression, or a diagnosis from one memory, route, or difficult morning.",
    visibleInGame: true,
    verified: true,
  },
  {
    id: "nia-memory-forgetfulness",
    title: "Memory Problems, Forgetfulness, and Aging",
    authorsOrAgency: "National Institute on Aging",
    year: 2023,
    sourceName: "National Institute on Aging",
    sourceType: "NIA",
    url: "https://www.nia.nih.gov/health/alzheimers-symptoms-and-diagnosis/do-memory-problems-always-mean-alzheimers-disease",
    relatedMechanic: "Notes, routines, and keeping familiar objects in consistent places",
    category: "Cue use",
    plainLanguageRelevance:
      "This official overview discusses everyday memory tools such as notes, calendars, routines, and consistent places for important objects.",
    claimBoundary:
      "The game does not use these moments to identify a condition or explain why a person forgets.",
    visibleInGame: true,
    verified: true,
  },
  {
    id: "pannu-kaszniak-metamemory",
    title: "Metamemory experiments in neurological populations: a review",
    authorsOrAgency: "Jasmeet K. Pannu and Alfred W. Kaszniak",
    year: 2005,
    sourceName: "Neuropsychology Review",
    sourceType: "PubMed",
    url: "https://pubmed.ncbi.nlm.nih.gov/16328731/",
    relatedMechanic: "Confidence choices and reflective Memory Book entries",
    category: "Memory confidence",
    plainLanguageRelevance:
      "The review describes metamemory as knowledge about one's own memory and the monitoring of remembering.",
    claimBoundary:
      "A confidence choice in the game is narrative reflection, not a test of memory or brain function.",
    visibleInGame: true,
    verified: true,
  },
  {
    id: "thompson-cue-salience",
    title: "Prospective memory function and cue salience in mild cognitive impairment",
    authorsOrAgency: "Claire L. Thompson, Julie D. Henry, Peter G. Rendell, et al.",
    year: 2017,
    sourceName: "Journal of Clinical and Experimental Neuropsychology",
    sourceType: "PubMed",
    url: "https://pubmed.ncbi.nlm.nih.gov/28145153/",
    relatedMechanic: "The phone draft and noticeable environmental reminders",
    category: "Prospective memory",
    plainLanguageRelevance:
      "This study examines remembering future intentions and how noticeable cues can affect that process.",
    claimBoundary:
      "The phone sequence is fiction and is not a reproduction of the study or an assessment task.",
    visibleInGame: true,
    verified: true,
  },
  {
    id: "coughlan-spatial-navigation",
    title:
      "Spatial navigation deficits - overlooked cognitive marker for preclinical Alzheimer disease?",
    authorsOrAgency: "Gillian Coughlan, Jan Laczo, Jakub Hort, et al.",
    year: 2018,
    sourceName: "Nature Reviews Neurology",
    sourceType: "PubMed",
    url: "https://pubmed.ncbi.nlm.nih.gov/29980763/",
    relatedMechanic: "Hallway uncertainty, landmarks, and visible Doorways",
    category: "Spatial navigation",
    plainLanguageRelevance:
      "This review surveys research on spatial navigation and orientation, which informed the game's use of landmarks and uncertain thresholds.",
    claimBoundary:
      "A moment of uncertainty in the hallway does not represent a symptom or support any diagnosis.",
    visibleInGame: true,
    verified: true,
  },
  {
    id: "wilson-neuropage",
    title: "Evaluation of NeuroPage: a new memory aid",
    authorsOrAgency: "Barbara A. Wilson, Jonathan J. Evans, Hazel Emslie, and Valerie Malinek",
    year: 1997,
    sourceName: "Journal of Neurology, Neurosurgery & Psychiatry",
    sourceType: "PubMed",
    url: "https://pubmed.ncbi.nlm.nih.gov/9221980/",
    relatedMechanic: "Phone reminders and external prompts",
    category: "External memory support",
    plainLanguageRelevance:
      "This study evaluated a portable reminder system for people with significant everyday memory and planning difficulties.",
    claimBoundary:
      "Soft Recall does not claim that one reminder system works for every person or situation.",
    visibleInGame: true,
    verified: true,
  },
  {
    id: "van-der-roest-assistive-technology",
    title: "Assistive technology for memory support in dementia",
    authorsOrAgency: "Henriette G. Van der Roest, Jennifer Wenborn, Channah Pastink, et al.",
    year: 2017,
    sourceName: "Cochrane Database of Systematic Reviews",
    sourceType: "PubMed",
    url: "https://pubmed.ncbi.nlm.nih.gov/28602027/",
    relatedMechanic: "Cue cards, object placement, and the Memory Book",
    category: "External memory support",
    plainLanguageRelevance:
      "This review describes electronic tools intended to support memory and daily activities, while finding that high-quality evidence was insufficient at the time.",
    claimBoundary:
      "The Memory Book is a narrative device, not a treatment, recommendation, or proven assistive intervention.",
    visibleInGame: true,
    verified: true,
  },
];

export const visibleResearchLinks = researchLinks.filter(
  (link) => link.visibleInGame && link.verified,
);
