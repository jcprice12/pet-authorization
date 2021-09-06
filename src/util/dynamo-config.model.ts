export interface DynamoConfig {
  tableName: string;
  pkName: string;
  skName: string;
  keyDelimiter: string;
}

export const PET_DYNAMO_CONFIG: DynamoConfig = {
  tableName: 'PetAuth',
  pkName: 'pk',
  skName: 'sk',
  keyDelimiter: '#'
};
