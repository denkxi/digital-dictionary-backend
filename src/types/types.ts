
export enum EQuestionType {
    Translation = 'translation',
    Writing = 'writing',
    Pronunciation = 'pronunciation',
    Mixed = 'mixed'
}

export enum EWordClass {
    Noun = "Noun",
    Verb = "Verb",
    Adjective = "Adjective",
    Adverb = "Adverb",
    Phrase = "Phrase",
    Expression = "Expression",
    Exclamation = "Exclamation",
}

export type SortOption = 'name-asc'|'name-desc'|'date-asc'|'date-desc';

export interface ListOptions {
    search?: string;
    sort?: SortOption;
    wordClass?: EWordClass;
    starred?: boolean;
    learned?: boolean;
    page: number;
    limit: number;
}
