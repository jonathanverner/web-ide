import sys
import traceback
from javascript import JSConstructor
from browser import window


class test(object):
    def __init__(self):
        self._st="10";

    def write(self,t):
        print("ST"+self._st+t)

    def st(self, st):
        self._st=st

testovaci_obj = test()


def run(code):
    try:
        _ = exec(code, globals())
        if _ is not None:
            print(repr(_))
    except:
        traceback.print_exc()

def write(text):
    pass

sys.stdout.write = sys.stderr.write = write
