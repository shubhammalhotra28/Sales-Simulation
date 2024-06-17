from flask import Flask, jsonify, request
import boto3
from flask_cors import CORS
from boto3.dynamodb.conditions import Key
import requests
import awsgi  # Import awsgi module for AWS Lambda integration
import json  # Add this import
from decimal import Decimal  # Add this import



# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('userDatabaseDDB-dev')

# Base route for API endpoints
BASE_ROUTE = "/fetchTake2AiData"

app = Flask(__name__)
CORS(app)





class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)



"""
This function should return the feedback and score
of the user last (latest entry stored within the db)
"""
@app.route(BASE_ROUTE, methods=["GET"])
def getFeedbackAndScore():

    try:
        email = request.args.get('email')
        name = request.args.get('name')

        if not email or not name:
            return jsonify({'error': 'Email and name are required parameters'}), 400

        response = table.query(
            KeyConditionExpression=Key('email').eq(email) & Key('name').eq(name),
            ScanIndexForward=False,  # Get the latest record first
            Limit=1
        )

        latest_record = response.get('Items', [])[0] if response.get('Items') else None

        if not latest_record:
            return jsonify({'error': 'No records found for the provided email and name'}), 404

        submissions = latest_record.get('submissions', [])
        
        if not submissions:
            return jsonify({'error': 'No submissions found for the provided email and name'}), 404
        
        # Print the submissions to debug
        print(f"Submissions: {json.dumps(submissions, indent=2, cls=DecimalEncoder)}")

        # Assuming the s3_url contains a timestamp and is formatted correctly
        latest_submission = max(submissions, key=lambda x: x['s3_url'])

        # Print the latest submission to debug
        print(f"Latest Submission: {json.dumps(latest_submission, indent=2, cls=DecimalEncoder)}")

        return jsonify({
            'latest_feedback': latest_submission['feedback'],
            'latest_score': latest_submission['score']  # Decimal will be converted by the custom encoder
        }), 200

    except Exception as e:
        print(f"Exception: {e}")
        return jsonify({'error': str(e)}), 500


def handler(event,context):
    
    return awsgi.response(app,event,context)
