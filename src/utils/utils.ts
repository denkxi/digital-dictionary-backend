import {IWordDocument} from "../models/Word";
import {EQuestionType} from "../types/types";

export function getAnswerForType(word: IWordDocument, type: EQuestionType): string {
    switch (type) {
        case EQuestionType.Translation:   return word.translation;
        case EQuestionType.Writing:       return word.writing;
        case EQuestionType.Pronunciation: return word.pronunciation || '';
        default:                          return '';
    }
}

export function getPromptForType(word: IWordDocument, type: EQuestionType): string {
    switch (type) {
        case EQuestionType.Translation:   return word.writing;
        case EQuestionType.Writing:       return word.translation;
        case EQuestionType.Pronunciation: return word.translation;
        default:                          return word.writing;
    }
}

export function randomQuestionType(): EQuestionType {
    const variants = [
        EQuestionType.Translation,
        EQuestionType.Writing,
        EQuestionType.Pronunciation,
    ]
    return variants[Math.floor(Math.random() * variants.length)];
}

export function fallbackType(word: IWordDocument, candidates: EQuestionType[]): EQuestionType {
    for (const t of candidates.sort(() => Math.random() - 0.5)) {
        if(getAnswerForType(word, t)){
            return t;
        }
    }
    return candidates[0];
}

export function escapeRegex(str: string): string {
    return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}