import { IQueryProps } from "./index";
import { ICandidate } from "./types";
export declare const useFuzzyConfig: (queryProps?: IQueryProps) => {
  candidate: ICandidate;
  setCandidates: (list: ICandidate[]) => void;
};
