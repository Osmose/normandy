from configparser import ConfigParser
from pathlib import Path


REPO_ROOT = Path(__file__, '..', '..', '..').resolve()
CONFIG_DIR = Path(REPO_ROOT, '.edi')
CONFIG_FILE = Path(CONFIG_DIR, 'config.ini')


class SaveableConfig(ConfigParser):
    def save(self):
        CONFIG_DIR.mkdir(exist_ok=True)
        with CONFIG_FILE.open('w') as f:
            self.write(f)


config = SaveableConfig()
config.read(str(CONFIG_FILE))
