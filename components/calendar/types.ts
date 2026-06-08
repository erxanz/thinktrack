export type CalendarNote = {
  id: string;
  title: string;
  content: string;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CalendarNoteForm = {
  title: string;
  content: string;
  scheduledAt: string;
};