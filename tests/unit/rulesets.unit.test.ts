// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';

interface Rule {
  type: string;
  parameters?: {
    allowed_merge_methods?: string[];
    strict_required_status_checks_policy?: boolean;
    required_status_checks?: { context: string }[];
  };
}
interface Ruleset {
  enforcement: string;
  conditions: { ref_name: { include: string[] } };
  rules: Rule[];
}

const DIR = '.github/rulesets';
const rulesets = readdirSync(DIR)
  .filter((file) => file.endsWith('.json'))
  .map((file) => JSON.parse(readFileSync(`${DIR}/${file}`, 'utf8')) as Ruleset);
const forBranch = (branch: string) =>
  rulesets.filter((set) =>
    set.conditions.ref_name.include.includes(`refs/heads/${branch}`),
  );

describe.each([
  { branch: 'dev', methods: ['squash'] },
  { branch: 'main', methods: ['merge'] },
])('ruleset for $branch', ({ branch, methods }) => {
  it('is the only active ruleset for the branch', () => {
    const sets = forBranch(branch);

    expect(sets).toHaveLength(1);
    expect(sets[0]?.enforcement).toBe('active');
  });

  it('allows a single merge method', () => {
    const pullRequest = forBranch(branch)[0]?.rules.find(
      (rule) => rule.type === 'pull_request',
    );

    expect(pullRequest?.parameters?.allowed_merge_methods).toEqual(methods);
  });

  it('requires the CI checks and blocks force pushes and deletion', () => {
    const rules = forBranch(branch)[0]?.rules ?? [];
    const checks = rules.find(
      (rule) => rule.type === 'required_status_checks',
    )?.parameters;

    expect(rules.map((rule) => rule.type).sort()).toEqual([
      'deletion',
      'non_fast_forward',
      'pull_request',
      'required_status_checks',
    ]);
    expect(checks?.strict_required_status_checks_policy).toBe(false);
    expect(
      checks?.required_status_checks?.map((check) => check.context).sort(),
    ).toEqual(['checks', 'e2e', 'pr-title']);
  });
});
