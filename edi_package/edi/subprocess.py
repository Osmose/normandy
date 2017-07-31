import atexit
import os
import signal
import subprocess


_child_pids = set()


@atexit.register
def _kill_children():
    global _child_pids
    for pid in _child_pids:
        try:
            os.kill(pid, signal.SIGTERM)
        except ProcessLookupError:
            pass


def run(*args, **kwargs):
    global _child_pids

    process = subprocess.Popen(*args, **kwargs)

    _child_pids.add(process.pid)
    output, error = process.communicate()
    _child_pids.remove(process.pid)

    if process.returncode:
        raise Exception(f'Command failed with return code {process.returncode}.')

    return output, error


class environment(object):
    def __init__(self, **kwargs):
        self.new_values = kwargs
        self.old_values = {}

    def __enter__(self):
        for name, value in self.new_values.items():
            self.old_values[name] = os.environ.get(name, None)
            os.environ[name] = value

    def __exit__(self, exc_type, exc_val, exc_tb):
        for name, value in self.old_values.items():
            if value is not None:
                os.environ[name] = value
            else:
                del os.environ[name]
