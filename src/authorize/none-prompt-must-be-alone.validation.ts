import { Prompt } from './prompt.enum';

export const nonePromptMustBeAlone = (prompts: Array<Prompt>): boolean => {
  if (prompts.some((prompt) => prompt === Prompt.NONE) && prompts.length > 1) {
    return false;
  }
  return true;
};
