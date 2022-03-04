// jest.config.ts
import { InitialOptionsTsJest, pathsToModuleNameMapper } from "ts-jest";
import { defaults as tsjPreset } from "ts-jest/presets";
import { compilerOptions } from "./tsconfig.json";

const config: InitialOptionsTsJest = {
  // [...]
  preset: "ts-jest",
  transform: {
    ...tsjPreset.transform,
    // [...]
  },
  testEnvironment: "jsdom",
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),
};

export default config;
