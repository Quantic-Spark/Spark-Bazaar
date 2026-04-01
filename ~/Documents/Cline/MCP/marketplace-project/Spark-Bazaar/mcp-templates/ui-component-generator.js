#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * UI Component Generator MCP Server
 * 
 * This server provides tools for generating UI components based on natural language descriptions.
 * It supports multiple frameworks (React, Vue, Angular) and styling approaches (Tailwind, Bootstrap, Material UI).
 */
class UIComponentGeneratorServer {
  constructor() {
    this.server = new Server(
      {
        name: 'ui-component-generator',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'generate_component',
          description: 'Generates a UI component based on a natural language description',
          inputSchema: {
            type: 'object',
            properties: {
              description: {
                type: 'string',
                description: 'Natural language description of the desired component',
              },
              framework: {
                type: 'string',
                description: 'Target framework for the component',
                enum: ['react', 'vue', 'angular'],
                default: 'react'
              },
              styling: {
                type: 'string',
                description: 'Styling approach to use',
                enum: ['tailwind', 'bootstrap', 'material-ui', 'vanilla-css'],
                default: 'tailwind'
              },
              features: {
                type: 'array',
                description: 'Additional features to include',
                items: {
                  type: 'string',
                  enum: ['responsive', 'accessible', 'dark-mode', 'animations']
                },
                default: ['responsive', 'accessible']
              },
              includePreview: {
                type: 'boolean',
                description: 'Whether to include a preview image',
                default: false
              }
            },
            required: ['description'],
          },
        },
        {
          name: 'modify_component',
          description: 'Modifies an existing UI component based on a natural language description',
          inputSchema: {
            type: 'object',
            properties: {
              existingCode: {
                type: 'string',
                description: 'Existing component code to modify',
              },
              modification: {
                type: 'string',
                description: 'Natural language description of the desired modifications',
              },
              framework: {
                type: 'string',
                description: 'Framework of the existing component',
                enum: ['react', 'vue', 'angular'],
                default: 'react'
              }
            },
            required: ['existingCode', 'modification'],
          },
        }
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'generate_component') {
        return this.handleGenerateComponent(request.params.arguments);
      } else if (request.params.name === 'modify_component') {
        return this.handleModifyComponent(request.params.arguments);
      } else {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }
    });
  }

  sanitizeForComment(input) {
    return input
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, ' ')
      .replace(/\r/g, '')
      .slice(0, 500);
  }

  static VALID_FRAMEWORKS = ['react', 'vue', 'angular'];
  static VALID_STYLING = ['tailwind', 'bootstrap', 'material-ui', 'vanilla-css'];
  static VALID_FEATURES = ['responsive', 'accessible', 'dark-mode', 'animations'];
  static MAX_INPUT_LENGTH = 10000;

  async handleGenerateComponent(args) {
    try {
      if (!args.description || typeof args.description !== 'string') {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Missing or invalid description parameter'
        );
      }

      if (args.description.length > UIComponentGeneratorServer.MAX_INPUT_LENGTH) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `description exceeds maximum length of ${UIComponentGeneratorServer.MAX_INPUT_LENGTH} characters`
        );
      }

      const framework = args.framework || 'react';
      if (!UIComponentGeneratorServer.VALID_FRAMEWORKS.includes(framework)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Invalid framework "${framework}". Must be one of: ${UIComponentGeneratorServer.VALID_FRAMEWORKS.join(', ')}`
        );
      }

      const styling = args.styling || 'tailwind';
      if (!UIComponentGeneratorServer.VALID_STYLING.includes(styling)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Invalid styling "${styling}". Must be one of: ${UIComponentGeneratorServer.VALID_STYLING.join(', ')}`
        );
      }

      const features = args.features || ['responsive', 'accessible'];
      if (!Array.isArray(features) || features.some(f => !UIComponentGeneratorServer.VALID_FEATURES.includes(f))) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Invalid features. Each must be one of: ${UIComponentGeneratorServer.VALID_FEATURES.join(', ')}`
        );
      }

      const includePreview = args.includePreview === true;

      let componentCode = '';
      if (framework === 'react') {
        componentCode = this.generateReactComponent(args.description, styling, features);
      } else if (framework === 'vue') {
        componentCode = this.generateVueComponent(args.description, styling, features);
      } else if (framework === 'angular') {
        componentCode = this.generateAngularComponent(args.description, styling, features);
      }

      // Prepare response content
      const responseContent = [
        {
          type: 'text',
          text: componentCode,
        }
      ];

      // Add preview image if requested
      if (includePreview) {
        responseContent.push({
          type: 'text',
          text: 'Preview image would be included here in the actual implementation.',
        });
      }

      return {
        content: responseContent,
      };
    } catch (error) {
      console.error('Error in handleGenerateComponent:', error);
      throw error;
    }
  }

  async handleModifyComponent(args) {
    try {
      if (!args.existingCode || typeof args.existingCode !== 'string') {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Missing or invalid existingCode parameter'
        );
      }
      if (!args.modification || typeof args.modification !== 'string') {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Missing or invalid modification parameter'
        );
      }

      if (args.existingCode.length > UIComponentGeneratorServer.MAX_INPUT_LENGTH) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `existingCode exceeds maximum length of ${UIComponentGeneratorServer.MAX_INPUT_LENGTH} characters`
        );
      }
      if (args.modification.length > UIComponentGeneratorServer.MAX_INPUT_LENGTH) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `modification exceeds maximum length of ${UIComponentGeneratorServer.MAX_INPUT_LENGTH} characters`
        );
      }

      const framework = args.framework || 'react';
      if (!UIComponentGeneratorServer.VALID_FRAMEWORKS.includes(framework)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Invalid framework "${framework}". Must be one of: ${UIComponentGeneratorServer.VALID_FRAMEWORKS.join(', ')}`
        );
      }

      const modifiedCode = this.modifyComponentCode(args.existingCode, args.modification, framework);

      return {
        content: [
          {
            type: 'text',
            text: modifiedCode,
          }
        ],
      };
    } catch (error) {
      console.error('Error in handleModifyComponent:', error);
      throw error;
    }
  }

  // Mock implementations of the component generation methods
  // In a real implementation, these would use AI models to generate components

  generateReactComponent(description, styling, features) {
    const safeDesc = this.sanitizeForComment(description);
    return `
// Generated React Component based on description: "${safeDesc}"
// Using ${styling} styling with features: ${features.join(', ')}
import React from 'react';

const Component = () => {
  return (
    <div className="container">
      <h2>Generated Component</h2>
      <p>This would be a fully functional component in the real implementation.</p>
    </div>
  );
};

export default Component;
`;
  }

  generateVueComponent(description, styling, features) {
    const safeDesc = this.sanitizeForComment(description);
    return `
<!-- Generated Vue Component based on description: "${safeDesc}" -->
<!-- Using ${styling} styling with features: ${features.join(', ')} -->
<template>
  <div class="container">
    <h2>Generated Component</h2>
    <p>This would be a fully functional component in the real implementation.</p>
  </div>
</template>

<script>
export default {
  name: 'GeneratedComponent',
}
</script>
`;
  }

  generateAngularComponent(description, styling, features) {
    const safeDesc = this.sanitizeForComment(description);
    return `
// Generated Angular Component based on description: "${safeDesc}"
// Using ${styling} styling with features: ${features.join(', ')}
import { Component } from '@angular/core';

@Component({
  selector: 'app-generated',
  template: \`
    <div class="container">
      <h2>Generated Component</h2>
      <p>This would be a fully functional component in the real implementation.</p>
    </div>
  \`
})
export class GeneratedComponent {
}
`;
  }

  modifyComponentCode(existingCode, modification, framework) {
    const safeMod = this.sanitizeForComment(modification);
    return `
// Modified component based on request: "${safeMod}"
// Original code length: ${existingCode.length} characters
// Framework: ${framework}

${existingCode}
`;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('UI Component Generator MCP server running on stdio');
  }
}

// Run the server when this script is executed directly
const server = new UIComponentGeneratorServer();
server.run().catch(console.error);
