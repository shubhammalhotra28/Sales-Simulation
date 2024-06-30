from flask import Flask, jsonify, request
import boto3
from flask_cors import CORS
from boto3.dynamodb.conditions import Key
import requests
import awsgi  # Import awsgi module for AWS Lambda integration

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('userDatabaseDDB-dev')

# Base route for API endpoints
BASE_ROUTE = "/deleteSubmission"

app = Flask(__name__)
CORS(app)


# Endpoint to handle DELETE requests for deleting a submission
@app.route(BASE_ROUTE, methods=["DELETE"])
def deleteSubmission():
    try:
        request_json = request.get_json()

        name = request_json.get("name")
        phone_number = request_json.get("phone_number")
        email = request_json.get("email")
        feedback = request_json.get("feedback")

        if not name or not phone_number or not email or not feedback:
            return jsonify({"error": "Missing required fields"}), 400

        # Query DynamoDB to retrieve the record for the email and name
        response = table.query(
            KeyConditionExpression=Key('email').eq(email) & Key('name').eq(name),
            ScanIndexForward=False,  # Get the latest record first
            Limit=1
        )
        item = response.get('Items', [])[0] if response.get('Items') else None

        if not item:
            return jsonify({"error": "User not found"}), 404

        submissions = item.get('submissions', [])

        # Find and remove the submission with the matching feedback
        updated_submissions = [sub for sub in submissions if sub.get('feedback') != feedback]

        if len(updated_submissions) == len(submissions):
            return jsonify({"error": "Submission with the specified feedback not found"}), 404

        # Update the item in DynamoDB with the modified submissions array
        table.update_item(
            Key={'email': email, 'name': name},
            UpdateExpression='SET submissions = :subs',
            ExpressionAttributeValues={':subs': updated_submissions}
        )

        return jsonify({"message": "Submission deleted successfully"}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def handler(event,context):
    
    return awsgi.response(app,event,context)