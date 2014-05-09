#!/usr/bin/python
import bottle
import sqlite3
import time
import json
import sys

app = bottle.app()
MAX_MSG_LEN = 2**10000
MAX_TIMEOUT = 10
DB_FILE = 'synchronize.db'

lg = open('log.txt','w')
static_root = ''

def initdb():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("DROP TABLE IF EXISTS messages")
    c.execute("CREATE TABLE messages ( channel test, msg text, time integer )")
    conn.commit()
    conn.close()

def save_msg(channel,msg):
    lg.write("CHAN: "+channel+"; MSG: "+msg+"; TIME:"+str(int(time.time()))+";\n");
    lg.flush();
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("INSERT INTO messages VALUES (?,?,?)",(channel,msg[:MAX_MSG_LEN], time.time()))
    conn.commit()
    conn.close()

def load_msgs(channel):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    now = time.time()
    c.execute("SELECT msg FROM messages WHERE channel=? AND time<?",(channel,now))
    ret = []
    for row in c:
        ret.append(row[0])
    c.execute("DELETE FROM messages WHERE channel=? AND time<?",(channel,now));
    conn.commit()
    conn.close()
    if len(ret) > 0:
        lg.write("READ "+str(len(ret))+" MANY MESSAGES\n");
    return ret


@bottle.route('/static/log/',method='POST')
@bottle.route('/log/',method='POST')
def logg():
    try:
        msg = str(bottle.request.forms.message);
    except:
        abort(404,"No log message");
    lg.write("LOG:"+msg+"\n");

@bottle.route('/static/<path:path>',method='GET')
def static(path):
    return bottle.static_file(path,root=static_root)


@bottle.route('/synchronize/<channel>/',method='GET')
def get_messages(channel):
    ret = load_msgs(channel)
    bottle.response.set_header('Content-Type','application/json');
    return json.dumps(ret)

@bottle.route('/synchronize/<channel>/',method='POST')
def post_message(channel):
    try:
        msg = str(bottle.request.forms.message)
    except:
        bottle.abort(400, "Missing required 'message' field")
    save_msg(channel, msg)
    bottle.response.status=201

initdb()

if __name__ == "__main__":
    try:
        port = int(sys.argv[1])
    except:
        port = 8000
    try:
        static_root = sys.argv[2]
    except:
        static_root = './'
    bottle.run(app=app,host='127.0.0.1',port=port,reloader=True)
