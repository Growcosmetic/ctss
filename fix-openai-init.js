#!/usr/bin/env node

/**
 * Script to fix OpenAI client initialization in all API routes
 * Changes from: const client = new OpenAI({ apiKey: ... })
 * To: Lazy initialization using getOpenAIClientSafe()
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all TypeScript files in app/api
const findFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
};

const apiFiles = findFiles('app/api');

let fixedCount = 0;

apiFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Pattern 1: const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    // Pattern 2: const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // Pattern 3: const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const patterns = [
      {
        // Match: import OpenAI from "openai"; ... const client = new OpenAI({ apiKey: ... });
        match: /import OpenAI from ["']openai["'];\s*\n\s*const\s+(client|openai)\s*=\s*new\s+OpenAI\(\s*\{\s*apiKey:\s*process\.env\.OPENAI_API_KEY[^}]*\}\s*\);/g,
        replace: (match, varName) => {
          return `import { getOpenAIClientSafe } from "@/lib/ai/openai";\n\n// Lazy initialize OpenAI client\nfunction getClient() {\n  return getOpenAIClientSafe();\n}`;
        }
      },
      {
        // Match: const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
        match: /const\s+(client|openai)\s*=\s*new\s+OpenAI\(\s*\{\s*apiKey:\s*process\.env\.OPENAI_API_KEY[^}]*\}\s*\);/g,
        replace: (match, varName) => {
          // Only replace if OpenAI is already imported
          if (content.includes('import OpenAI from')) {
            return `// Client initialized lazily via getClient()`;
          }
          return match;
        }
      }
    ];

    // Check if file has OpenAI initialization
    if (content.includes('new OpenAI({') && content.includes('apiKey:')) {
      // First, add import if needed
      if (!content.includes('getOpenAIClientSafe')) {
        // Replace OpenAI import
        content = content.replace(
          /import OpenAI from ["']openai["'];?/g,
          `import { getOpenAIClientSafe } from "@/lib/ai/openai";`
        );
        modified = true;
      }

      // Replace const client = new OpenAI(...) with lazy init
      const beforeReplace = content;
      content = content.replace(
        /const\s+(client|openai)\s*=\s*new\s+OpenAI\(\s*\{\s*apiKey:\s*process\.env\.OPENAI_API_KEY[^}]*\}\s*\);?/g,
        `// Client initialized lazily via getClient()`
      );

      if (content !== beforeReplace) {
        // Add getClient function if not exists
        if (!content.includes('function getClient()')) {
          const importIndex = content.indexOf('import');
          const nextLineIndex = content.indexOf('\n', importIndex) + 1;
          content = content.slice(0, nextLineIndex) + 
            `\n// Lazy initialize OpenAI client\nfunction getClient() {\n  return getOpenAIClientSafe();\n}\n` +
            content.slice(nextLineIndex);
        }
        modified = true;
      }

      // Replace client. or openai. with getClient().
      content = content.replace(/\b(client|openai)\.chat\.completions\.create\(/g, 'getClient().chat.completions.create(');
      content = content.replace(/\b(client|openai)\.audio\./g, 'getClient().audio.');
      content = content.replace(/\b(client|openai)\./g, 'getClient().');

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${filePath}`);
        fixedCount++;
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Fixed ${fixedCount} files!`);

