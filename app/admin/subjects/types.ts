export type Section = {
  id: string;
  grade: string;
  name: string;
  subjectCount: number;
};

export type Subject = {
  id: string;
  sectionId: string;
  name: string;
  code: string;
  days: string[];
  startTime: string | null;
  endTime: string | null;
};
