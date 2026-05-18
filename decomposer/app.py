from flask import Flask, request, jsonify
from flask_cors import CORS
from hanzi_chaizi import HanziChaizi  # Correct import statement

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

hc = HanziChaizi()

@app.route('/decompose', methods=['GET'])
def decompose_hanzi():
    word = request.args.get('word', '')
    if not word:
        return jsonify({"error": "Missing 'word' parameter"}), 400

    result = []
    for char in word:
        components = hc.query(char)
        
        result.append({
            "character": char,
            "components": components if components else [char]
        })

    return jsonify({"word": word, "decomposition": result})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)