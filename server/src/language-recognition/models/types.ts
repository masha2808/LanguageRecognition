export enum TypeEnum {
  text = 'Text',
  audio = 'Audio',
}

export type RecognizedLanguage = {
  text: string;
  language: string;
  file_name?: string;
};

export type AuthorizationUserData = {
  id: number;
  email: string;
};
