/** Read projection only. Accepted answers and grading metadata stay on the server. */
export type WordRecord = {
  lexemeId: string; senseId: string; language: string; native: string; meaning: string;
  reading?: string; forms: { native: string; reading: string | null }[];
  grammar?: string; combinations: string[];
  lessons: { activityId: string; lessonId: string; title: string }[];
  encountered: boolean; saved: boolean; recognized: boolean; recalled: boolean;
  retrievedLater: boolean; usedInContext: boolean; supported: boolean;
  dueAt: string | null; practiceHref: string | null; practiceStarted: boolean;
  reviewStatus: string;
};
export type WordsSummary = { language: string; words: WordRecord[] };
export type WordDetail = { example: { sentence: string; situation: string } | null; saved: true };
