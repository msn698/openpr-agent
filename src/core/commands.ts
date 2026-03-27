export type Command =
  | { kind: 'fix'; args: string[] }
  | { kind: 'review'; args: string[] }
  | { kind: 'none' };

const prefixPattern = /^\s*@(openpr|openpr-agent)\s+/i;

export function parseCommand(commentBody: string): Command {
  if (!prefixPattern.test(commentBody)) {
    return { kind: 'none' };
  }

  const stripped = commentBody.replace(prefixPattern, '').trim();
  const [rawCommand = '', ...args] = stripped.split(/\s+/);
  const cmd = rawCommand.toLowerCase();

  if (cmd === 'fix') {
    return { kind: 'fix', args };
  }

  if (cmd === 'review') {
    return { kind: 'review', args };
  }

  return { kind: 'none' };
}
