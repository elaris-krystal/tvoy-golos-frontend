import { createContext, useContext, useReducer, ReactNode } from "react";
import type { Region, CategoryKey, ClassificationResult } from "../types";

interface AppState {
  region: Region | null;
  categoryKey: CategoryKey | null;
  subcategoryKey: string | null;
  generatedText: string;
  editedText: string;
  editPct: number;
  currentCaseId: string;
  officialResponse: string;
  classification: ClassificationResult | null;
  escalationCount: number;
  step: number;
}

const initialState: AppState = {
  region: null,
  categoryKey: null,
  subcategoryKey: null,
  generatedText: "",
  editedText: "",
  editPct: 0,
  currentCaseId: "",
  officialResponse: "",
  classification: null,
  escalationCount: 0,
  step: 1,
};

type Action =
  | { type: "SET_REGION"; payload: Region }
  | { type: "SET_CATEGORY"; payload: CategoryKey }
  | { type: "SET_SUBCATEGORY"; payload: string }
  | { type: "SET_GENERATED_TEXT"; payload: string }
  | { type: "SET_EDITED_TEXT"; payload: string }
  | { type: "SET_EDIT_PCT"; payload: number }
  | { type: "SET_CASE_ID"; payload: string }
  | { type: "SET_OFFICIAL_RESPONSE"; payload: string }
  | { type: "SET_CLASSIFICATION"; payload: ClassificationResult | null }
  | { type: "INCREMENT_ESCALATION" }
  | { type: "SET_STEP"; payload: number }
  | { type: "RESET" };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_REGION": return { ...state, region: action.payload, step: 2 };
    case "SET_CATEGORY": return { ...state, categoryKey: action.payload, subcategoryKey: null, step: 2 };
    case "SET_SUBCATEGORY": return { ...state, subcategoryKey: action.payload, step: 3 };
    case "SET_GENERATED_TEXT": return { ...state, generatedText: action.payload, editedText: action.payload, step: 4 };
    case "SET_EDITED_TEXT": return { ...state, editedText: action.payload };
    case "SET_EDIT_PCT": return { ...state, editPct: action.payload };
    case "SET_CASE_ID": return { ...state, currentCaseId: action.payload };
    case "SET_OFFICIAL_RESPONSE": return { ...state, officialResponse: action.payload };
    case "SET_CLASSIFICATION": return { ...state, classification: action.payload };
    case "INCREMENT_ESCALATION": return { ...state, escalationCount: state.escalationCount + 1 };
    case "SET_STEP": return { ...state, step: action.payload };
    case "RESET": return initialState;
    default: return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
