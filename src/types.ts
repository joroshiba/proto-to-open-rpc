export interface OpenRPCDocument {
  openrpc: string;
  info: InfoObject;
  methods: MethodObject[];
  components?: ComponentsObject;
}

export interface InfoObject {
  title: string;
  version: string;
  description?: string;
}

export interface MethodObject {
  name: string;
  description?: string;
  params: ParameterObject[];
  result: ResultObject;
}

export interface ParameterObject {
  name: string;
  description?: string;
  required: boolean;
  schema: SchemaObject;
}

export interface ResultObject {
  name: string;
  description?: string;
  schema: SchemaObject;
}

export interface SchemaObject {
  type?: string;
  properties?: Record<string, SchemaObject>;
  items?: SchemaObject;
  required?: string[];
  $ref?: string;
}

export interface ComponentsObject {
  schemas?: Record<string, SchemaObject>;
}

export interface ProtoService {
  name: string;
  methods: ProtoMethod[];
}

export interface ProtoMethod {
  name: string;
  requestType: string;
  responseType: string;
  requestStream: boolean;
  responseStream: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: Record<string, any>;
}

export interface ProtoMessage {
  name: string;
  fields: ProtoField[];
}

export interface ProtoField {
  name: string;
  type: string;
  id: number;
  rule?: 'optional' | 'required' | 'repeated';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: Record<string, any>;
}