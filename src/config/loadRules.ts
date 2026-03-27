import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { rulesSchema, type RulesConfig } from './schema.js';

const defaultConfig: RulesConfig = rulesSchema.parse({});

export function loadRules(repoRoot: string): RulesConfig {
  const yamlPath = path.join(repoRoot, '.openpr.yml');
  const jsonPath = path.join(repoRoot, '.openpr.json');

  if (fs.existsSync(yamlPath)) {
    const content = fs.readFileSync(yamlPath, 'utf8');
    return rulesSchema.parse(yaml.load(content) ?? {});
  }

  if (fs.existsSync(jsonPath)) {
    const content = fs.readFileSync(jsonPath, 'utf8');
    return rulesSchema.parse(JSON.parse(content));
  }

  return defaultConfig;
}
