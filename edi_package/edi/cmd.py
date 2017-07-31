from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

import click


REPO_ROOT = Path(__file__, '..', '..', '..').resolve()
IGNORED_DIRS = (
    'node_modules',
)


@click.group()
def cli():
    pass


def find_command_files(path):
    for child_path in path.iterdir():
        if child_path.is_dir() and not should_ignore(child_path):
            yield from find_command_files(child_path)
        if child_path.name == 'edi_commands.py':
            yield child_path


def should_ignore(path):
    return path.name in IGNORED_DIRS or path.match('.*')


def main():
    for edi_path in find_command_files(REPO_ROOT):
        spec = spec_from_file_location('.'.join(edi_path.parts), edi_path)
        edi_module = module_from_spec(spec)
        spec.loader.exec_module(edi_module)
    cli()
