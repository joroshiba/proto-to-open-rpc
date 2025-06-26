import { 
  OpenRPCDocument, 
  InfoObject, 
  MethodObject, 
  ParameterObject, 
  ResultObject, 
  SchemaObject, 
  ComponentsObject,
  ProtoService, 
  ProtoMethod, 
  ProtoMessage, 
  ProtoField 
} from './types';

export class OpenRPCGenerator {
  private messages: Map<string, ProtoMessage> = new Map();

  generateOpenRPCDocument(
    services: ProtoService[], 
    messages: ProtoMessage[], 
    title: string = 'Generated API',
    version: string = '1.0.0',
    description?: string
  ): OpenRPCDocument {
    this.messages.clear();
    messages.forEach(msg => this.messages.set(msg.name, msg));

    const info: InfoObject = {
      title,
      version,
      description
    };

    const methods: MethodObject[] = [];
    services.forEach(service => {
      service.methods.forEach(method => {
        const openRPCMethod = this.convertMethodToOpenRPC(method, service.name);
        methods.push(openRPCMethod);
      });
    });

    const components: ComponentsObject = {
      schemas: this.generateSchemas(messages)
    };

    return {
      openrpc: '1.3.0',
      info,
      methods,
      components
    };
  }

  private convertMethodToOpenRPC(method: ProtoMethod, serviceName: string): MethodObject {
    const methodName = `${serviceName}.${method.name}`;
    
    const params: ParameterObject[] = [];
    const requestMessage = this.messages.get(method.requestType);
    
    if (requestMessage) {
      if (method.requestStream) {
        params.push({
          name: 'requests',
          description: `Stream of ${method.requestType} messages`,
          required: true,
          schema: {
            type: 'array',
            items: { $ref: `#/components/schemas/${method.requestType}` }
          }
        });
      } else {
        requestMessage.fields.forEach(field => {
          params.push({
            name: field.name,
            description: `Field from ${method.requestType}`,
            required: field.rule === 'required',
            schema: this.convertFieldToSchema(field)
          });
        });
      }
    }

    const result: ResultObject = {
      name: 'result',
      description: `Response of type ${method.responseType}`,
      schema: method.responseStream 
        ? {
            type: 'array',
            items: { $ref: `#/components/schemas/${method.responseType}` }
          }
        : { $ref: `#/components/schemas/${method.responseType}` }
    };

    return {
      name: methodName,
      description: `RPC method ${method.name} from service ${serviceName}`,
      params,
      result
    };
  }

  private generateSchemas(messages: ProtoMessage[]): Record<string, SchemaObject> {
    const schemas: Record<string, SchemaObject> = {};
    
    messages.forEach(message => {
      schemas[message.name] = this.convertMessageToSchema(message);
    });
    
    return schemas;
  }

  private convertMessageToSchema(message: ProtoMessage): SchemaObject {
    const properties: Record<string, SchemaObject> = {};
    const required: string[] = [];
    
    message.fields.forEach(field => {
      properties[field.name] = this.convertFieldToSchema(field);
      if (field.rule === 'required') {
        required.push(field.name);
      }
    });
    
    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined
    };
  }

  private convertFieldToSchema(field: ProtoField): SchemaObject {
    let baseSchema = this.convertProtoTypeToJsonSchema(field.type);
    
    if (field.rule === 'repeated') {
      return {
        type: 'array',
        items: baseSchema
      };
    }
    
    return baseSchema;
  }

  private convertProtoTypeToJsonSchema(protoType: string): SchemaObject {
    switch (protoType) {
      case 'double':
      case 'float':
        return { type: 'number' };
      case 'int32':
      case 'int64':
      case 'uint32':
      case 'uint64':
      case 'sint32':
      case 'sint64':
      case 'fixed32':
      case 'fixed64':
      case 'sfixed32':
      case 'sfixed64':
        return { type: 'integer' };
      case 'bool':
        return { type: 'boolean' };
      case 'string':
        return { type: 'string' };
      case 'bytes':
        return { type: 'string' };
      default:
        if (this.messages.has(protoType)) {
          return { $ref: `#/components/schemas/${protoType}` };
        }
        return { type: 'string' };
    }
  }
}