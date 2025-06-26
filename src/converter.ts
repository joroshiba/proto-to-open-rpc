import { ProtoParser } from './proto-parser';
import { OpenRPCGenerator } from './openrpc-generator';
import { OpenRPCDocument } from './types';

export interface ConversionOptions {
  title?: string;
  version?: string;
  description?: string;
}

export class ProtoToOpenRPCConverter {
  private protoParser: ProtoParser;
  private openRPCGenerator: OpenRPCGenerator;

  constructor() {
    this.protoParser = new ProtoParser();
    this.openRPCGenerator = new OpenRPCGenerator();
  }

  async convertFromFile(filePath: string, options: ConversionOptions = {}): Promise<OpenRPCDocument> {
    const { services, messages } = await this.protoParser.parseProtoFile(filePath);
    
    return this.openRPCGenerator.generateOpenRPCDocument(
      services,
      messages,
      options.title || 'Generated API',
      options.version || '1.0.0',
      options.description
    );
  }

  convertFromContent(content: string, options: ConversionOptions = {}): OpenRPCDocument {
    const { services, messages } = this.protoParser.parseProtoContent(content);
    
    return this.openRPCGenerator.generateOpenRPCDocument(
      services,
      messages,
      options.title || 'Generated API',
      options.version || '1.0.0',
      options.description
    );
  }
}