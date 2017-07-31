from functools import wraps
from pathlib import Path
from shutil import rmtree, which
from textwrap import dedent

import click
import requests

from edi import cli, config, CONFIG_DIR, REPO_ROOT, run


ADDON_ROOT = Path(__file__, '..').resolve()
BOOTSTRAP_URL = (
    'https://hg.mozilla.org/mozilla-central/raw-file/default/python/mozboot/bin/bootstrap.py'
)


@cli.group()
def addon():
    pass


def requires_bootstrap(func):
    @wraps(func)
    def wrapped(*args, **kwargs):
        if not config.has_option('addon', 'repo_path'):
            raise click.ClickException(
                'Add-on config missing. Please run `edi addon bootstrap` before running this '
                'command.'
            )
        return func(*args, **kwargs)
    return wrapped


@addon.command()
def bootstrap():
    config_changed = False

    if not which('hg'):
        raise click.ClickException(
            'Mercurial (hg) command not found; please install it before running addon bootstrap.'
        )

    if not config.has_option('addon', 'repo_path'):
        click.echo('mozilla-central path not found in config.')
        bootstrap_repo_path()
        config_changed = True

    repo = Path(config.get('addon', 'repo_path'))
    if not repo.exists():
        click.echo(f'No directory found at {repo}.')
        bootstrap_repo(repo)

    if config_changed:
        config.save()


def bootstrap_repo_path():
    click.echo('Looking for existing checkout...')
    repo_parent = REPO_ROOT.joinpath('..').resolve()

    mc_path = repo_parent.joinpath('mozilla-central')
    if mc_path.exists():
        if click.confirm(
            f'Found mozilla-central checkout {mc_path}; do you want to use this for add-on testing?'
        ):
            config.set('addon', 'repo_path', str(mc_path))
            return

    config.set('addon', 'repo_path', click.prompt(
        'Please enter the path you want to store your mozilla checkout in. If the directory '
        'doesn\'t exist, edi will create it and pull down mozilla automatically.',
        default=str(CONFIG_DIR.joinpath('mozilla-central'))
    ))


def bootstrap_repo(repo):
    if not which('python2.7'):
        raise click.ClickException(
            'Bootstrapping a new mozilla-central checkout requires that python2.7 is available on '
            'your PATH. Please install it and try again.'
        )

    response = requests.get(BOOTSTRAP_URL)
    response.raise_for_status()

    repo.mkdir(parents=True)
    try:
        run(['hg', 'clone', 'https://hg.mozilla.org/mozilla-central', '.'], cwd=repo)
        run([
            './mach', 'bootstrap',
            '--application-choice', 'browser_artifact_mode',
            '--no-interactive',
        ], cwd=repo)
        with repo.joinpath('mozconfig').open('a') as f:
            f.write(dedent('''\
            # Automatically download and use compiled C++ components:
            ac_add_options --enable-artifact-builds
            '''))
        run(['./mach', 'build'], cwd=repo)
    except:
        rmtree(repo)


@addon.command()
@requires_bootstrap
def update_checkout():
    checkout_path = config.get('addon', 'repo_path')
    run(['hg', 'pull', 'central'], cwd=checkout_path)
    run([
        'hg', 'revert',
        '--all',
        '--no-backup',
        'browser/extensions/shield-recipe-client'
    ], cwd=checkout_path)
    run(['hg', 'up', 'central'], cwd=checkout_path)


@addon.command()
@requires_bootstrap
def test():
    checkout_path = config.get('addon', 'repo_path')
    run(['./bin/update-mozilla-central.sh', checkout_path], cwd=ADDON_ROOT)
    run(['./mach', 'test', 'browser/extensions/shield-recipe-client/test'], cwd=checkout_path)


@addon.command()
@requires_bootstrap
def lint():
    checkout_path = config.get('addon', 'repo_path')
    run(['./bin/update-mozilla-central.sh', checkout_path], cwd=ADDON_ROOT)
    run(['./mach', 'lint', 'browser/extensions/shield-recipe-client'], cwd=checkout_path)


@cli.command()
@click.argument('mach_args', nargs=-1)
@requires_bootstrap
def mach(mach_args):
    checkout_path = config.get('addon', 'repo_path')
    run(['./mach', *mach_args], cwd=checkout_path)
