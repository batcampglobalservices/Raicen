export const CURRICULUM_SOURCE = "https://syllabus.ng/";
export const curriculumContext: Record<string, { subject: string; level: string; objectives: string[]; scope: string[] }> = {
  "Algebraic expressions": { subject: "Mathematics", level: "SSS 1", objectives: ["identify variables, constants, coefficients, and terms", "collect like terms", "substitute values and solve simple equations"], scope: ["notation and vocabulary", "like and unlike terms", "simplification", "substitution"] },
  "Cells and organisation": { subject: "Biology", level: "SSS 1", objectives: ["identify major cell structures", "relate structure to function", "compare plant and animal cells"], scope: ["cell theory", "organelles", "specialised cells", "levels of organisation"] },
  "Reading for meaning": { subject: "English Language", level: "SSS 1", objectives: ["identify main ideas and supporting evidence", "infer meaning from context", "summarise a passage accurately"], scope: ["comprehension", "inference", "vocabulary in context", "summary"] },
  "States of matter": { subject: "Chemistry", level: "SSS 1", objectives: ["describe particles in solids, liquids, and gases", "explain changes of state", "connect temperature to particle movement"], scope: ["particle model", "diffusion", "melting and boiling", "evaporation"] },
};
