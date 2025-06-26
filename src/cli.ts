#!/usr/bin/env node

import { Command } from 'commander';
import { ProtoToOpenRPCConverter } from './converter';
import { promises as fs } from 'fs';
import path from 'path';

const program = new Command();

program
  .name('proto-to-open-rpc')
  .description('Convert Protocol Buffer RPC definitions to OpenRPC format')
  .version('1.0.0');

program
  .command('convert')
  .description('Convert a proto file to OpenRPC format')
  .argument('<input>', 'Input proto file path')
  .option('-o, --output <file>', 'Output JSON file path')
  .option('-t, --title <title>', 'API title', 'Generated API')
  .option('-v, --version <version>', 'API version', '1.0.0')
  .option('-d, --description <description>', 'API description')
  .option('--pretty', 'Pretty print JSON output', false)
  .action(async (input: string, options) => {
    try {
      const converter = new ProtoToOpenRPCConverter();
      
      const inputPath = path.resolve(input);
      const openRPCDoc = await converter.convertFromFile(inputPath, {
        title: options.title,
        version: options.version,
        description: options.description
      });
      
      const jsonOutput = options.pretty 
        ? JSON.stringify(openRPCDoc, null, 2)
        : JSON.stringify(openRPCDoc);
      
      if (options.output) {
        const outputPath = path.resolve(options.output);
        await fs.writeFile(outputPath, jsonOutput);
        console.log(`OpenRPC document generated: ${outputPath}`);
      } else {
        console.log(jsonOutput);
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('convert-content')
  .description('Convert proto content from stdin to OpenRPC format')
  .option('-o, --output <file>', 'Output JSON file path')
  .option('-t, --title <title>', 'API title', 'Generated API')
  .option('-v, --version <version>', 'API version', '1.0.0')
  .option('-d, --description <description>', 'API description')
  .option('--pretty', 'Pretty print JSON output', false)
  .action(async (options) => {
    try {
      const converter = new ProtoToOpenRPCConverter();
      
      let content = '';
      for await (const chunk of process.stdin) {
        content += chunk;
      }
      
      const openRPCDoc = converter.convertFromContent(content, {
        title: options.title,
        version: options.version,
        description: options.description
      });
      
      const jsonOutput = options.pretty 
        ? JSON.stringify(openRPCDoc, null, 2)
        : JSON.stringify(openRPCDoc);
      
      if (options.output) {
        const outputPath = path.resolve(options.output);
        await fs.writeFile(outputPath, jsonOutput);
        console.log(`OpenRPC document generated: ${outputPath}`);
      } else {
        console.log(jsonOutput);
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();