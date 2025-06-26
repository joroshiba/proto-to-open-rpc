# Proto to OpenRPC Converter

A utility that converts Protocol Buffer RPC definitions to OpenRPC format.

## Installation

```bash
npm install
npm run build
```

## Usage

### CLI Usage

Convert a proto file to OpenRPC format:

```bash
# Convert proto file and output to console
npx proto-to-open-rpc convert examples/sample.proto --pretty

# Convert proto file and save to file
npx proto-to-open-rpc convert examples/sample.proto -o output.json --pretty

# Convert with custom metadata
npx proto-to-open-rpc convert examples/sample.proto \
  --title "My API" \
  --version "2.0.0" \
  --description "My awesome API" \
  --pretty
```

Convert proto content from stdin:

```bash
# Convert proto content from stdin
cat examples/sample.proto | npx proto-to-open-rpc convert-content --pretty
```

### Programmatic Usage

```typescript
import { ProtoToOpenRPCConverter } from 'proto-to-open-rpc';

const converter = new ProtoToOpenRPCConverter();

// Convert from file
const openRPCDoc = await converter.convertFromFile('path/to/service.proto', {
  title: 'My API',
  version: '1.0.0',
  description: 'API description'
});

// Convert from content string
const protoContent = `
  syntax = "proto3";
  
  service MyService {
    rpc GetData (GetDataRequest) returns (GetDataResponse) {}
  }
  
  message GetDataRequest {
    string id = 1;
  }
  
  message GetDataResponse {
    string data = 1;
  }
`;

const openRPCDoc2 = converter.convertFromContent(protoContent, {
  title: 'My API',
  version: '1.0.0'
});

console.log(JSON.stringify(openRPCDoc, null, 2));
```

## Features

- ✅ Convert proto3 service definitions to OpenRPC format
- ✅ Support for streaming RPC methods (client, server, and bidirectional)
- ✅ Handle nested message types and references
- ✅ Support for repeated fields (arrays)
- ✅ Convert proto data types to JSON Schema types
- ✅ Generate proper OpenRPC 1.3.0 compliant documents
- ✅ CLI interface with customization options
- ✅ TypeScript support with full type definitions

## Supported Proto Features

### Service Methods
- Unary RPC: `rpc Method (Request) returns (Response)`
- Server streaming: `rpc Method (Request) returns (stream Response)`
- Client streaming: `rpc Method (stream Request) returns (Response)`
- Bidirectional streaming: `rpc Method (stream Request) returns (stream Response)`

### Message Types
- All proto3 scalar types (string, int32, int64, bool, double, float, etc.)
- Nested message types
- Repeated fields (converted to JSON arrays)
- Message references (converted to JSON Schema $ref)

### Proto to JSON Schema Type Mapping
- `string` → `"type": "string"`
- `int32, int64, uint32, uint64, sint32, sint64, fixed32, fixed64, sfixed32, sfixed64` → `"type": "integer"`
- `double, float` → `"type": "number"`
- `bool` → `"type": "boolean"`
- `bytes` → `"type": "string"`
- Custom message types → `"$ref": "#/components/schemas/MessageName"`

## Example

Input proto file:
```protobuf
syntax = "proto3";

service UserService {
  rpc GetUser (GetUserRequest) returns (User) {}
  rpc ListUsers (ListUsersRequest) returns (stream User) {}
}

message GetUserRequest {
  string id = 1;
}

message User {
  string id = 1;
  string name = 2;
  repeated string roles = 3;
}

message ListUsersRequest {
  int32 page = 1;
  int32 page_size = 2;
}
```

Generated OpenRPC output:
```json
{
  "openrpc": "1.3.0",
  "info": {
    "title": "Generated API",
    "version": "1.0.0"
  },
  "methods": [
    {
      "name": "UserService.GetUser",
      "description": "RPC method GetUser from service UserService",
      "params": [
        {
          "name": "id",
          "description": "Field from GetUserRequest",
          "required": false,
          "schema": {
            "type": "string"
          }
        }
      ],
      "result": {
        "name": "result",
        "description": "Response of type User",
        "schema": {
          "$ref": "#/components/schemas/User"
        }
      }
    }
  ],
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "roles": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      }
    }
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run linting
npm run lint

# Type checking
npm run typecheck
```

## License

MIT