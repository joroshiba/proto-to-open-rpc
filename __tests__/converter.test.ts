import { ProtoToOpenRPCConverter } from '../src/converter';
import path from 'path';

describe('ProtoToOpenRPCConverter', () => {
  let converter: ProtoToOpenRPCConverter;

  beforeEach(() => {
    converter = new ProtoToOpenRPCConverter();
  });

  describe('convertFromContent', () => {
    test('should convert simple proto service to OpenRPC', () => {
      const protoContent = `
        syntax = "proto3";
        
        service TestService {
          rpc TestMethod (TestRequest) returns (TestResponse) {}
        }
        
        message TestRequest {
          string name = 1;
          int32 age = 2;
        }
        
        message TestResponse {
          string message = 1;
        }
      `;

      const result = converter.convertFromContent(protoContent, {
        title: 'Test API',
        version: '1.0.0',
        description: 'Test description'
      });

      expect(result.openrpc).toBe('1.3.0');
      expect(result.info.title).toBe('Test API');
      expect(result.info.version).toBe('1.0.0');
      expect(result.info.description).toBe('Test description');
      expect(result.methods).toHaveLength(1);
      expect(result.methods[0].name).toBe('TestService.TestMethod');
      expect(result.methods[0].params).toHaveLength(2);
      expect(result.components?.schemas).toHaveProperty('TestRequest');
      expect(result.components?.schemas).toHaveProperty('TestResponse');
    });

    test('should handle streaming methods', () => {
      const protoContent = `
        syntax = "proto3";
        
        service StreamService {
          rpc StreamMethod (stream StreamRequest) returns (stream StreamResponse) {}
        }
        
        message StreamRequest {
          string data = 1;
        }
        
        message StreamResponse {
          string result = 1;
        }
      `;

      const result = converter.convertFromContent(protoContent);
      
      expect(result.methods).toHaveLength(1);
      expect(result.methods[0].params[0].name).toBe('requests');
      expect(result.methods[0].params[0].schema.type).toBe('array');
      expect(result.methods[0].result.schema.type).toBe('array');
    });

    test('should handle repeated fields', () => {
      const protoContent = `
        syntax = "proto3";
        
        service ListService {
          rpc GetList (ListRequest) returns (ListResponse) {}
        }
        
        message ListRequest {
          repeated string tags = 1;
        }
        
        message ListResponse {
          repeated string items = 1;
        }
      `;

      const result = converter.convertFromContent(protoContent);
      
      expect(result.components?.schemas?.ListRequest.properties?.tags.type).toBe('array');
      expect(result.components?.schemas?.ListResponse.properties?.items.type).toBe('array');
    });

    test('should handle nested message types', () => {
      const protoContent = `
        syntax = "proto3";
        
        service UserService {
          rpc GetUser (GetUserRequest) returns (User) {}
        }
        
        message GetUserRequest {
          string id = 1;
        }
        
        message User {
          string name = 1;
          UserProfile profile = 2;
        }
        
        message UserProfile {
          string bio = 1;
        }
      `;

      const result = converter.convertFromContent(protoContent);
      
      expect(result.components?.schemas?.User.properties?.profile.$ref).toBe('#/components/schemas/UserProfile');
      expect(result.components?.schemas).toHaveProperty('UserProfile');
    });

    test('should handle multiple services', () => {
      const protoContent = `
        syntax = "proto3";
        
        service ServiceA {
          rpc MethodA (RequestA) returns (ResponseA) {}
        }
        
        service ServiceB {
          rpc MethodB (RequestB) returns (ResponseB) {}
        }
        
        message RequestA { string data = 1; }
        message ResponseA { string result = 1; }
        message RequestB { int32 value = 1; }
        message ResponseB { int32 result = 1; }
      `;

      const result = converter.convertFromContent(protoContent);
      
      expect(result.methods).toHaveLength(2);
      expect(result.methods[0].name).toBe('ServiceA.MethodA');
      expect(result.methods[1].name).toBe('ServiceB.MethodB');
    });
  });
  
  describe('convertFromFile', () => {
    test('should convert proto file to OpenRPC', async () => {
      const sampleProtoPath = path.join(__dirname, '../examples/sample.proto');
      
      const result = await converter.convertFromFile(sampleProtoPath, {
        title: 'Sample API',
        version: '2.0.0'
      });

      expect(result.openrpc).toBe('1.3.0');
      expect(result.info.title).toBe('Sample API');
      expect(result.info.version).toBe('2.0.0');
      expect(result.methods.length).toBeGreaterThan(0);
      expect(result.components?.schemas).toBeDefined();
    });
  });
});