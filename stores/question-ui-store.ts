/**
 * Zustand Store for UI-Only State
 * 
 * CRITICAL: This store MUST NOT contain server data.
 * Server data belongs in TanStack Query cache.
 * 
 * This store handles:
 * - UI preferences (view mode, selected items)
 * - Quiz/exam progress
 * - Transient UI state
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface QuestionUIState {
  // Selected question for detail view
  selectedQuestionId: string | null;
  setSelectedQuestionId: (id: string | null) => void;

  // View mode
  viewMode: "card" | "list" | "compact";
  setViewMode: (mode: "card" | "list" | "compact") => void;

  // Filter panel visibility
  isFilterPanelOpen: boolean;
  toggleFilterPanel: () => void;
  
  // Quiz/Exam session state (NOT server data)
  quizProgress: {
    currentQuestionIndex: number;
    answeredQuestions: Set<string>;
    startedAt: number | null;
  };
  startQuiz: () => void;
  answerQuestion: (questionId: string) => void;
  nextQuestion: () => void;
  endQuiz: () => void;

  // Reset
  reset: () => void;
}

const initialState = {
  selectedQuestionId: null,
  viewMode: "card" as const,
  isFilterPanelOpen: false,
  quizProgress: {
    currentQuestionIndex: 0,
    answeredQuestions: new Set<string>(),
    startedAt: null,
  },
};

export const useQuestionUIStore = create<QuestionUIState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setSelectedQuestionId: (id) => set({ selectedQuestionId: id }),

        setViewMode: (mode) => set({ viewMode: mode }),

        toggleFilterPanel: () =>
          set((state) => ({ isFilterPanelOpen: !state.isFilterPanelOpen })),

        startQuiz: () =>
          set({
            quizProgress: {
              currentQuestionIndex: 0,
              answeredQuestions: new Set(),
              startedAt: Date.now(),
            },
          }),

        answerQuestion: (questionId) =>
          set((state) => ({
            quizProgress: {
              ...state.quizProgress,
              answeredQuestions: new Set([
                ...state.quizProgress.answeredQuestions,
                questionId,
              ]),
            },
          })),

        nextQuestion: () =>
          set((state) => ({
            quizProgress: {
              ...state.quizProgress,
              currentQuestionIndex: state.quizProgress.currentQuestionIndex + 1,
            },
          })),

        endQuiz: () =>
          set({
            quizProgress: {
              currentQuestionIndex: 0,
              answeredQuestions: new Set(),
              startedAt: null,
            },
          }),

        reset: () => set(initialState),
      }),
      {
        name: "question-ui-store",
        partialize: (state) => ({
          viewMode: state.viewMode,
          isFilterPanelOpen: state.isFilterPanelOpen,
        }),
      }
    ),
    { name: "QuestionUIStore" }
  )
);
