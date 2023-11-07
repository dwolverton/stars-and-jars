export default interface Account {
  id: string;
  participants: Participant[];
  participantsById: { [id:string]: Participant };
}

export interface Participant {
  id: string;
  name: string;
  jarTypes: JarType[];
  labels: Label[];
}

export interface JarType {
  id: number;
  name: string;
  color: string;
  size: number;
}

export interface Label {
  text: string;
  jarType: number;
}

export const BLANK_ACCOUNT: Account = {
  id: "",
  participants: [],
  participantsById: {}
}

export const BLANK_PARTICIPANT: Participant = {
  id: "",
  name: "",
  labels: [],
  jarTypes: []
}

export const BLANK_JAR_TYPE: JarType = {
  id: 0,
  name: "",
  color: "",
  size: 0
}