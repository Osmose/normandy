import subprocess
from contextlib import contextmanager
from functools import wraps
from pathlib import Path
from shutil import which

import click

from edi import cli, config, environment, run


SERVER_ROOT = Path(__file__, '..').resolve()


@cli.group()
def server():
    if not config.has_section('server'):
        config.add_section('server')


def requires_bootstrap(func):
    @wraps(func)
    def wrapped(*args, **kwargs):
        if not config.getboolean('server', 'bootstrapped', default=False):
            raise click.ClickException(
                'Server config missing. Please run `edi server bootstrap` before running this '
                'command.'
            )
        return func(*args, **kwargs)
    return wrapped


def docker_container_exists(name):
    output, error = run(['docker', 'ps', '-aq', '-f', f'name={name}'], stdout=subprocess.PIPE)
    return len(output) > 0


@contextmanager
def postgres():
    if not docker_container_exists('normandy-postgres'):
        run([
            'docker', 'create',
            '--name', 'normandy-postgres',
            '-e', 'POSTGRES_USER=normandy',
            '-e', 'POSTGRES_PASSWORD=asdf',
            '-p', '5432:5432',
            'postgres',
        ])

    run(['docker', 'start', 'normandy-postgres'])
    try:
        with environment(DATABASE_URL='postgres://normandy:asdf@localhost/normandy'):
            yield
    finally:
        run(['docker', 'stop', 'normandy-postgres'])


@contextmanager
def autograph():
    if not docker_container_exists('normandy-autograph'):
        run([
            'docker', 'create',
            '--name', 'normandy-autograph',
            '-p', '8745:8000',
            'mozilla/autograph',
        ])

    env_vars = {
        'DJANGO_AUTOGRAPH_URL': 'http://localhost:8745/',
        'DJANGO_AUTOGRAPH_HAWK_ID': 'normandev',
        'DJANGO_AUTOGRAPH_HAWK_SECRET_KEY': '3dhoaupudifjjvm7xznd9bn73159xn3xwr77b61kzdjwzzsjts',
    }

    run(['docker', 'start', 'normandy-autograph'])
    try:
        with environment(**env_vars):
            yield
    finally:
        run(['docker', 'stop', 'normandy-autograph'])


def run_manage(cmd, *args, **kwargs):
    return run(['./manage.py'] + cmd, *args, cwd=SERVER_ROOT, **kwargs)


@server.command()
def bootstrap():
    if not which('docker'):
        raise click.ClickException(
            'Docker command not found; please install it before running addon:bootstrap.'
        )

    with postgres():
        # Install python deps
        run([
            'pip', 'install',
            '-r', 'requirements/default.txt',
            '-c', 'requirements/constraints.txt'
        ], cwd=SERVER_ROOT)

        # Install frontend deps and build
        run(['npm', 'install'], cwd=SERVER_ROOT)
        run(['npm', 'run', 'build'], cwd=SERVER_ROOT)

        # Run migrations
        run_manage(['migrate'])

        # Create superuser
        if click.confirm('Do you want to create an admin user?'):
            run_manage(['createsuperuser'])

        # Load actions
        run_manage(['update_actions'])

        # Update product_details
        run_manage(['update_product_details'])

        # Load initial data
        run_manage(['initial_data'])

    # Pull geolocation DB
    run(['./bin/download_geolite2.sh'], cwd=SERVER_ROOT)

    config.set('server', 'bootstrapped', 'yes')
    config.save()


@server.command('run')
def run_server():
    with postgres():
        with autograph():
            run(['./bin/runsslserver.sh'], cwd=SERVER_ROOT)


@server.command()
def pytest():
    with postgres():
        run(['py.test'], cwd=SERVER_ROOT)
