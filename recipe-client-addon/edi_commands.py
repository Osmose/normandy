import click

from edi import cli


@cli.command('addon:test')
def addon_test():
    click.echo('addon test')
