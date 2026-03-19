// Core Administrator types
export interface GetAdministratorDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accountActivated: boolean;
  creationTime: string;
  updateTime?: string;
}

export interface CreateAdministratorDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// User types
export interface GetUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  memberSince: string;
  thumbnailUrl?: string;
  active?: boolean;
}

// Session types
export interface SessionInfoDto {
  id: string;
  creationTime: string;
  expiresAt: string;
  consumed: boolean;
}

// Information Page types
export interface InformationPageDto {
  id: string;
  title: string;
  description: string;
  content: string;
  contentType: string;
  status: string;
  creationTime: string;
  updateTime?: string;
}

export interface CreateInformationPageDto {
  title: string;
  description: string;
  content: string;
  contentType: string;
  status: string;
}

// Information Tag types
export interface InformationTagDto {
  id: string;
  name: string;
  creationTime: string;
}

export interface CreateInformationTagDto {
  name: string;
}

// Navigation Menu types
export interface NavigationMenuDto {
  id: string;
  position: number;
  label: string;
  url: string;
  creationTime: string;
}

export interface CreateNavigationMenuDto {
  position: number;
  label: string;
  url: string;
}

// Configuration types
export interface ConfigurationDto {
  id: string;
  name: string;
  inhalation: number;
  retention1: number;
  exhalation: number;
  retention2: number;
  durationMinutes: number;
  difficulty: number;
  objective: string;
  guidanceType: string;
}

export interface CreateConfigurationDto {
  name: string;
  inhalation: number;
  retention1: number;
  exhalation: number;
  retention2: number;
  durationMinutes: number;
  difficulty: number;
  objective: string;
  guidanceType: string;
}

// Quiz types
export interface QuizzDto {
  id: string;
  nom: string;
  active: boolean;
  questionCount: number;
  questions?: QuestionDto[];
}

export interface CreateQuizzDto {
  nom: string;
  active: boolean;
  questions?: CreateQuestionForQuizDto[];
}

export interface CreateQuestionForQuizDto {
  text: string;
  position: number;
  options?: CreateResponseOptionForQuestionDto[];
}

export interface CreateResponseOptionForQuestionDto {
  label: string;
  position: number;
  targetedField: string;
  operation: string;
  value: string;
}

export interface QuestionDto {
  id: string;
  text: string;
  position: number;
  idQuizz: string;
  responsesOptions?: ResponseOptionDto[];
}

export interface CreateQuestionDto {
  text: string;
  position: number;
  idQuizz: string;
}

export interface ResponseOptionDto {
  id: string;
  label: string;
  position: number;
  targetedField: string;
  operation: string;
  value: string;
  idQuestions: string;
}

export interface CreateResponseOptionDto {
  label: string;
  position: number;
  targetedField: string;
  operation: string;
  value: string;
  idQuestions: string;
}

// Admin Log types
export interface AdminLogDto {
  id: string;
  actionCode: string;
  entityType: string;
  targetedEntityId?: string;
  description: string;
  creationTime: string;
  administratorId: string;
}
