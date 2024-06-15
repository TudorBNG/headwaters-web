import { KeyProps } from "../pages/main/main";

export interface LabelEntry {
    label: string;
    uncovered: number;
}

export interface Section {
    index: string;
    title: string;
    uncovered: number;
    keys: KeyProps[];
    labels: LabelEntry[];
}

export interface Division {
    index: string;
    title: string;
    uncovered: number;
    sections: Section[];
}