from builtins import open
from os import path
from setuptools import setup, find_packages


BASE_DIR = path.abspath(path.dirname(__file__))


# Get the long description from the README file
with open(path.join(BASE_DIR, 'README.md'), encoding='utf-8') as f:
    long_description = f.read()


setup(
    name='normandy-edi',

    # Versions should comply with PEP440.  For a discussion on single-sourcing
    # the version across setup.py and the project code, see
    # https://packaging.python.org/en/latest/single_source_version.html
    version='0.1.0',

    description='Command-line client for interacting with a Normandy checkout.',
    long_description=long_description,

    # The project's main homepage.
    url='https://github.com/mozilla/normandy',

    # Author details
    author='Osmose (Michael Kelly)',
    author_email='me@mkelly.me',

    # Choose your license
    license='MPL-2.0',

    # You can just specify the packages manually here if your project is
    # simple. Or you can use find_packages().
    packages=find_packages(exclude=['contrib', 'docs', 'tests']),

    # List run-time dependencies here.  These will be installed by pip when
    # your project is installed. For an analysis of "install_requires" vs pip's
    # requirements files see:
    # https://packaging.python.org/en/latest/requirements.html
    install_requires=['click'],

    # To provide executable scripts, use entry points in preference to the
    # "scripts" keyword. Entry points provide cross-platform support and allow
    # pip to create the appropriate form of executable for the target platform.
    entry_points={
        'console_scripts': [
            'edi=edi:main',
        ],
    },
)
