const fs = require("fs");
const path = require("path");

// Define the custom action function OUTSIDE of module.exports, or pass it directly.
// The provided function is correct, but let's ensure it's accessible.
// We will register it inside module.exports.

function getExistingApiConfigs(appConfigPath) {
  const configs = [];
  try {
    const fileContent = fs.readFileSync(appConfigPath, "utf8");
    
    // 1. Extract function variables and their import paths
    const importRegex = /import\s+\{\s*(\w+)\s*\}\s+from\s+["'](\.\.\/src\/[^"']+)["'];/g;
    let match;
    const functionImports = {};
    while ((match = importRegex.exec(fileContent)) !== null) {
       // Only track imports if they are used in the functions array
       if (fileContent.includes(`functions: [`).includes(match[1])) {
           functionImports[match[1]] = match[2];
       }
    }
    
    const functionsArrayMatch = fileContent.match(/functions:\s*\[([^\]]+)\]/s);
    if (!functionsArrayMatch) return configs;

    const functionVariables = functionsArrayMatch[1]
      .split(",")
      .map(fn => fn.trim())
      .filter(Boolean);

    // 2. Process each function variable
    for (const variable of functionVariables) {
      let importPath = functionImports[variable];

      if (!importPath) continue;
      
      const appConfigDir = path.dirname(appConfigPath);
      let configFilePath = path.resolve(appConfigDir, `${importPath}.ts`);

      if (!fs.existsSync(configFilePath)) {
          // Check alternative path if .ts suffix isn't needed
          const alternativePath = path.resolve(appConfigDir, `${importPath}`);
          if (fs.existsSync(alternativePath)) {
            configFilePath = alternativePath;
          } else {
            continue;
          }
      } 
      
      const configContent = fs.readFileSync(configFilePath, "utf8");

      // 3. Extract endpoint and method
      const endpointMatch = configContent.match(/endpoint:\s*["']([^"']+)["']/);
      const methodMatch = configContent.match(/method:\s*["']([^"']+)["']/);

      if (endpointMatch && methodMatch) {
        configs.push({
          variable: variable,
          endpoint: endpointMatch[1],
          method: methodMatch[1],
          file: path.relative(process.cwd(), configFilePath)
        });
      }
    }

  } catch (error) {
    console.error("Error reading app-config.ts or function config files:", error.message);
  }

  return configs;
}

module.exports = function (plop) {
  
  // --- Register the Custom Action ---
  plop.setActionType("appendConfig", function (data, config, plop) {
    const configPath = path.resolve(process.cwd(), "bin/app-config.ts");
    const { functionName } = data; // e.g., 'getProduct'

    // The function variable will be 'getProductFunction'
    const functionVariable = `${functionName}Function`;

    // The import path, using the new function name
    const importStatement = `import { ${functionVariable} } from "../src/api/http/${functionName}/${functionName}.config";\n`;

    // 1. Read the file content
    let fileContent = fs.readFileSync(configPath, "utf8");

    // 2. Append the new import statement after 'import path from "path";'
    const pathImportLine = 'import path from "path";';
    // Find the end of the line: 'import path from "path";' + newline character
    let insertIndex = fileContent.indexOf(pathImportLine) + pathImportLine.length + 1;

    if (insertIndex > pathImportLine.length) {
      // Insert the new import statement
      fileContent = fileContent.slice(0, insertIndex) + importStatement + fileContent.slice(insertIndex);
    } else {
      // Fallback: This block should only execute if the file structure is non-standard
      console.warn("Could not find 'import path from \"path\";' for clean insertion.");
      fileContent = importStatement + fileContent;
    }

    // 3. Add the new function variable to the 'functions' array
    // Regex matches: functions: [ ... anything not ] ... ]
    const functionsRegex = /(functions:\s*\[[^\]]*?)(\]|\n\s*\])/s;

    fileContent = fileContent.replace(functionsRegex, (match, p1, p2) => {
      // p1 is the content before the closing bracket (e.g., 'functions: [helloFunction, courseFunction')
      // p2 is the closing bracket (e.g., ']' or '\n    ]')

      // Determine separator: comma + space, unless the array is empty
      let separator = p1.trim().endsWith('[') ? '' : ', ';

      return `${p1.trim()}${separator}${functionVariable}${p2}`;
    });

    // 4. Write the modified content back to the file
    fs.writeFileSync(configPath, fileContent, "utf8");

    // This is the success message Plop will print
    return `Appended ${functionVariable} import and function to bin/app-config.ts`;
  });
  // --- End of Custom Action Registration ---
  
  plop.setGenerator("lambda-api", {
    description: "Scaffold a new Lambda API function",

    prompts: [
      {
        type: "input",
        name: "functionName",
        // ... (validation logic remains the same)
        message: "Function name (ex: course):",
        validate: functionName => {
          const value = String(functionName || "").trim();
          if (!value) return "Function name is required";

          const configPath = path.resolve(process.cwd(), "bin/app-config.ts");
          if (!fs.existsSync(configPath)) {
            return "bin/app-config.ts not found!";
          }

          const fileContent = fs.readFileSync(configPath, "utf8");

          const match = fileContent.match(/functions:\s*\[([^\]]+)\]/);

          if (match) {
            const functionsArray = match[1]
              .split(",")
              .map(fn => fn.trim())
              .filter(Boolean);

            const exists = functionsArray.some(fn =>
              fn.toLowerCase().includes(functionName.toLowerCase())
            );

            if (exists) {
              return `Function '${functionName}' already exists in app-config.ts`;
            }
          }

          return true;
        }
      },
      {
        type: "list",
        name: "triggerType",
        message: "trigger type:",
        choices: ["HTTP"]
      },
      {
        type: "input",
        name: "endpoint",
        message: "API endpoint (ex: course):"
      },
      {
        type: "list",
        name: "method",
        message: "HTTP Method:",
        choices: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        validate: (method, answers) => {
           const endpoint = String(answers.endpoint || "").trim();
           const currentMethod = method.toUpperCase();

           if (!endpoint) {
               // Should not happen, but a safe guard
               return "Cannot validate: Endpoint is missing from answers."; 
           }

           const configPath = path.resolve(process.cwd(), "bin/app-config.ts");
           const existingConfigs = getExistingApiConfigs(configPath);

           console.log("ex-config", existingConfigs)
           
           // Check if the combination of (endpoint, method) already exists
           const conflict = existingConfigs.find(config => 
             config.endpoint.toLowerCase() === endpoint.toLowerCase() && 
             config.method.toUpperCase() === currentMethod
           );

           if (conflict) {
             return `API Conflict: The endpoint '${endpoint}' with method '${currentMethod}' already exists in ${conflict.file}.`;
           }

           return true;
        }
      }
    ],

    actions: data => {
      const basePath = `src/api/http/${data.functionName}`;

      return [
        {
          type: "add",
          path: `${basePath}/${data.functionName}.ts`,
          templateFile: "plop-templates/lambda.ts.hbs"
        },
        {
          type: "add",
          path: `${basePath}/${data.functionName}.config.ts`,
          templateFile: "plop-templates/config.ts.hbs"
        },
        {
          type: "appendConfig",
        }
      ];
    }
  });
};