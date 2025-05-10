
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

export interface CreateWordDTO {
    dictionaryId: string;
    categoryId?: string;
    writing: string;
    translation: string;
    pronunciation?: string;
    definition?: string;
    useExample?: string;
    wordClass?: string;
    isStarred?: boolean;
    isLearned?: boolean;
}

export interface IUserSummary {
    userId: string;
    totalQuizzes: number;
    perfectScores: number;
    totalMistakes: number;
    mostMissedWordIds: string[];
    averageScorePercent: number;
}

export interface IDictionarySummary {
    dictionaryId: string;
    totalWords: number;
    learnedWords: number;
    percentageLearned: number;
    quizzesTaken: number;
    averageQuizScore: number;
}