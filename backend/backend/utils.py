from flask import jsonify

def response(success, message="", data=None, code=200):
    return jsonify({
        "success": success,
        "message": message,
        "data": data
    }), code
