import esbuild from 'esbuild';
import { appStack } from './bin/app-config';

type Functions = {
    srcFile: string;
    output: string;
};

const handlers = appStack.config.functions;
const authHandlers = appStack.config.authorizer;

const commonBuildOptions: esbuild.BuildOptions = {
  bundle: true,
  minify: true,
  platform: 'node',
  target: 'node20',  // or whichever Node.js version you are using
  treeShaking: true,  // Enable aggressive tree-shaking
  sourcemap: false,
  external: [],  // Add any external dependencies here if needed (e.g., 'aws-sdk' for Lambdas)
};

const buildAuthFunctions = async (): Promise<void> => {
  try {
    for (let item of authHandlers) {
      const srcFile = item.config.authFunction.config.srcFile;
      const output = item.config.authFunction.config.output;
      await esbuild.build({
        entryPoints: [srcFile],
        outfile: output,
        ...commonBuildOptions,
      });
      console.log(`Built ${output}`);
    }
  } catch (error) {
    console.error(error);
  }
};

const buildFunctions = async (): Promise<void> => {
  try {
    for (const item of handlers) {
      await esbuild.build({
        entryPoints: [item.config.srcFile],
        outfile: item.config.output,
        ...commonBuildOptions,
      });
      console.log(`Built ${item.config.output}`);
    }
  } catch (error) {
    console.error(error);
  }
};

buildAuthFunctions();
buildFunctions();