// jest.config.ts
import type { InitialOptionsTsJest } from "ts-jest";
import { defaults as tsjPreset } from "ts-jest/presets";
// import { defaultsESM as tsjPreset } from 'ts-jest/presets'
// import { jsWithTs as tsjPreset } from 'ts-jest/presets'
// import { jsWithTsESM as tsjPreset } from 'ts-jest/presets'
// import { jsWithBabel as tsjPreset } from 'ts-jest/presets'
// import { jsWithBabelESM as tsjPreset } from 'ts-jest/presets'

const config: InitialOptionsTsJest = {
  // [...]
  transform: {
    ...tsjPreset.transform,
    // [...]
  },
  testEnvironment: "jsdom",
};

export default config;
