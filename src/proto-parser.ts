import * as protobuf from 'protobufjs';
import { ProtoService, ProtoMethod, ProtoMessage, ProtoField } from './types';

export class ProtoParser {
  private root: protobuf.Root;

  constructor() {
    this.root = new protobuf.Root();
  }

  async parseProtoFile(filePath: string): Promise<{ services: ProtoService[], messages: ProtoMessage[] }> {
    try {
      this.root = await protobuf.load(filePath);
      
      const services = this.extractServices();
      const messages = this.extractMessages();
      
      return { services, messages };
    } catch (error) {
      throw new Error(`Failed to parse proto file: ${error}`);
    }
  }

  parseProtoContent(content: string): { services: ProtoService[], messages: ProtoMessage[] } {
    try {
      this.root = protobuf.parse(content).root;
      
      const services = this.extractServices();
      const messages = this.extractMessages();
      
      return { services, messages };
    } catch (error) {
      throw new Error(`Failed to parse proto content: ${error}`);
    }
  }

  private extractServices(): ProtoService[] {
    const services: ProtoService[] = [];
    
    const findServices = (nested: protobuf.ReflectionObject): void => {
      if (nested instanceof protobuf.Service) {
        const service: ProtoService = {
          name: nested.name,
          methods: this.extractMethods(nested)
        };
        services.push(service);
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((nested as any).nestedArray) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (nested as any).nestedArray.forEach(findServices);
      }
    };
    
    this.root.nestedArray.forEach(findServices);
    
    return services;
  }

  private extractMethods(service: protobuf.Service): ProtoMethod[] {
    const methods: ProtoMethod[] = [];
    
    Object.values(service.methods).forEach(method => {
      const protoMethod: ProtoMethod = {
        name: method.name,
        requestType: method.requestType,
        responseType: method.responseType,
        requestStream: method.requestStream || false,
        responseStream: method.responseStream || false,
        options: method.options || {}
      };
      methods.push(protoMethod);
    });
    
    return methods;
  }

  private extractMessages(): ProtoMessage[] {
    const messages: ProtoMessage[] = [];
    
    const findMessages = (nested: protobuf.ReflectionObject): void => {
      if (nested instanceof protobuf.Type) {
        const message: ProtoMessage = {
          name: nested.name,
          fields: this.extractFields(nested)
        };
        messages.push(message);
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((nested as any).nestedArray) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (nested as any).nestedArray.forEach(findMessages);
      }
    };
    
    this.root.nestedArray.forEach(findMessages);
    
    return messages;
  }

  private extractFields(type: protobuf.Type): ProtoField[] {
    const fields: ProtoField[] = [];
    
    Object.values(type.fields).forEach(field => {
      const protoField: ProtoField = {
        name: field.name,
        type: field.type,
        id: field.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rule: (field as any).rule as 'optional' | 'required' | 'repeated' | undefined,
        options: field.options || {}
      };
      fields.push(protoField);
    });
    
    return fields;
  }
}