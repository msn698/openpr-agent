import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';

export async function getInstallationClient(appId: string, privateKey: string, installationId: number): Promise<Octokit> {
  const auth = createAppAuth({ appId, privateKey });
  const installationAuthentication = await auth({ type: 'installation', installationId });

  return new Octokit({ auth: installationAuthentication.token });
}
