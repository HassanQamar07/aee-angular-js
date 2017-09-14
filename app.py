#!/usr/bin/python2.7

import json
from flask import Flask, jsonify, make_response, abort
import pymongo
from bson.objectid import ObjectId
from flask import request
from flask import helpers
import urlparse

STAGING_COLLECTION='dockets_staging'

STATES = (
    'AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA',
    'MA',
    'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA',
    'RI',
    'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY','FERC')

SERVER='localhost'
PORT=28256

AEE_CLIENT = pymongo.MongoClient("mongodb://arbisoft:craw1777@%s:%s/puc"%(SERVER,PORT), PORT)
AEE_CLIENT_STAGING = pymongo.MongoClient("mongodb://arbisoft:craw1777@%s:%s/puc-staging"%(SERVER,PORT), PORT)
REMOTE_DB = AEE_CLIENT["puc"]
LOCAL_CLIENT = pymongo.MongoClient("localhost", 27017)
LOCAL_DB = LOCAL_CLIENT["puc"]
STAGING_DB = AEE_CLIENT_STAGING['puc-staging']

LOG_FILES_PATH = '/media/scrapestore/DistributedCrawl/weekly/logs/puc'

db = REMOTE_DB
app = Flask(__name__)
APP_PORT=5000

@app.route('/files/<path:path>')
def static_proxy(path):
    global LOG_FILES_PATH
    if '.json' in path:
        LOG_FILES_PATH = '/media/scrapestore/DistributedCrawl/weekly/items/puc'
    # send_static_file will guess the correct MIME type
    return helpers.send_from_directory(LOG_FILES_PATH, path,mimetype='text/plain')
    # return app.send_static_file('./home/hassan/Downloads/%s' % path)

@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)


@app.route('/')
def index():
    return get_stats()


@app.route('/states', methods=['GET'])
def get_states():
    return jsonify({'states': STATES})


@app.route('/stats', methods=['GET'])
def get_stats():
    stats = []
    for state in STATES:
        count = db.dockets.find({'state': state}).count()
        stats.append({'state': state, 'total_dockets': count})
    return jsonify({'stats': stats})


@app.route('/states/<state>/runs/<type>', methods=['GET'])
def get_stats_by_state(state, type):
    runs = []
    type = type.lower()
    state = state.upper()
    if type.lower() == 'all':
        spider_types = ["%s_weekly_spider" % state, "%s_daily_spider" % state,
                        "%s_favorites_spider" % state,"%s_recrawl_spider"%state,"%s_active_spider"%state]
    elif type == 'favorite':
        spider_types = ["%s_favorites_spider" % state]
    elif type == 'daily':
        spider_types = ["%s_daily_spider" % state]
    elif type == 'weekly':
        spider_types = ["%s_weekly_spider" % state]
    elif type == 'recrawl':
        spider_types = ["%s_recrawl_spider" % state]
    elif type == 'active':
        spider_types = ["%s_active_spider" % state]


    else:
	spider_types=[]
    if state in STATES:
        query = db.distributed_weekly_stats.find({'spider_name': {'$in': spider_types}},
                                                 {'spider_name': 1, 'status': 1, 'start_time': 1}).sort(
            [('_id', -1)]).limit(100)
        runs = list(query)
        for run in runs:
            run['_id'] = str(run['_id'])
    if runs:
        return jsonify({'state': state, 'runs': runs})
    else:
        abort(404)


@app.route('/states/<state>/runs/<run_id>/jobs', methods=['GET'])
def get_runs_jobs(state, run_id):
    if len(run_id) != 24 and state not in STATES:
        abort(404)
        return
    query = db.distributed_weekly_stats.find({'_id': ObjectId(run_id)},
                                             {'jobs.status': 1, 'jobs.error_count': 1, 'jobs.start_time': 1,
                                              'jobs.drop_count': 1, 'jobs._id': 1, 'jobs.stats.item_scraped_count': 1,
                                              '_id': 0})
    return jsonify({'runs': list(query)})


# @app.route('/states/<state>/runs/<run_id>')
# def get_state_runs(state, run_id):
#     return jsonify({})

@app.route('/states/<state>/dockets', methods=['GET'])
def get_state_dockets(state):
    global db
    cursor = request.args.get('cursor')
    state_id = request.args.get('state_id')
    col = STAGING_COLLECTION if request.args.get('staging', '').lower() == 'true' else 'dockets'
    db=STAGING_DB if request.args.get('staging', '').lower() == 'true' else db
    docket_url = 'http://%s:%s/states/%s/dockets/%s?staging=%s'%(urlparse.urlparse(request.url).hostname,APP_PORT,state,"%s",request.args.get('staging', '').lower())
    where_dict = {'state': state}
    if cursor:
        where_dict['_id'] = {'$lt': ObjectId(cursor)}
    if state_id:
        where_dict['state_id'] = state_id
    query = db[col].find(where_dict, {'state_id': 1,'crawled_at':1}).sort([('_id', -1)]).limit(100)
    dockets = list(query)
    where_dict.pop('_id',None)
    total_dockets = db[col].find(where_dict).count()
    try:
        cursor = str(dockets[99]['_id'])
    except:
        cursor=''
    return jsonify({'states': state, 'meta': {'total_dockets': total_dockets, 'cursor': cursor},
                    'dockets': [{'state_id': docket['state_id'],'crawled_at':docket.get('crawled_at'), 'id': str(docket['_id']),'url':docket_url%docket['_id']} for docket in dockets]})

@app.route('/states/<state>/jobs/<job>/dockets', methods=['GET'])
def get_job_dockets(state, job):
    cursor = request.args.get('cursor')
    where_dict = {'state': state, 'job_id': job}
    col = 'dockets'

    if cursor:
        where_dict['_id'] = {'$lt': ObjectId(cursor)}
    query = db[col].find(where_dict, {'state_id': 1}).sort([('_id', -1)]).limit(100)
    total_dockets = ''
    dockets = list(query)
    cursor = str(dockets[-1]['_id']) if dockets else ''

    return jsonify({'states': state, 'meta': {'total_dockets': total_dockets, 'cursor': cursor},
                    'dockets': [{'state_id': docket['state_id'], 'id': str(docket['_id'])} for docket in dockets]})

@app.route('/states/<state>/dockets/<id>', methods=['GET'])
def get_state_dockets_by_id(state, id):

    global db
    col = STAGING_COLLECTION if request.args.get('staging', '').lower() == 'true' else 'dockets'
    db=STAGING_DB if request.args.get('staging', '').lower() == 'true' else db
    query = db[col].find({'state': state, '_id': ObjectId(id)}).sort([('_id', -1)]).limit(100)
    dockets = list(query)
    for docket in dockets:
        docket['_id'] = str(docket['_id'])
    return jsonify({'states': state,
                    'dockets': dockets})


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response


if __name__ == '__main__':
    app.run('0.0.0.0', debug=True,port=1500)

