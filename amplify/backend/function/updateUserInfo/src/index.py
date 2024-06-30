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
BASE_ROUTE = "/updateUserInfo"

app = Flask(__name__)
CORS(app)

# Endpoint to handle POST requests for saving form data
@app.route(BASE_ROUTE, methods=["POST"])
def storeUserToDB():
    
    try:
        data = request.json

        new_user_details = data.get('newUserDetails')

        if not new_user_details:
            return jsonify({"error": "Invalid input"}), 400


        new_email = new_user_details.get('email')
        new_name = new_user_details.get('name')
        new_phone = new_user_details.get('phone')

        if not new_email or not new_name or not new_phone:
            return jsonify({"error": "Missing required fields"}), 400

        item = {
                'name': new_name,
                'email': new_email,
                'phone_number': new_phone,
            }
        print('item = ',item)
        table.put_item(Item=item)

        return jsonify({'message': 'Data stored successfully'}), 200


    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route(BASE_ROUTE, methods=["PUT"])
def updateUserInfo():
    try:
        request_json = request.json

        old_user_details = request_json.get('oldUserDetails')
        new_user_details = request_json.get('newUserDetails')

        if not new_user_details or not old_user_details:
            return jsonify({"error": "Invalid input"}), 400

        new_email = new_user_details.get('email')
        new_name = new_user_details.get('name')
        new_phone = new_user_details.get('phone')

        if not new_email or not new_name or not new_phone:
            return jsonify({"error": "Missing required fields"}), 400

        prev_email = old_user_details.get('email')
        prev_name = old_user_details.get('name')
        prev_phone = old_user_details.get('phone')

        if not prev_email or not prev_name or not prev_phone:
            return jsonify({"error": "Missing required fields"}), 400

        # Query DynamoDB to retrieve the latest record for the email and name
        response = table.query(
            KeyConditionExpression=Key('email').eq(prev_email) & Key('name').eq(prev_name),
            ScanIndexForward=False,  # Get the latest record first
            Limit=1
        )
        latest_record = response.get('Items', [])[0] if response.get('Items') else None

        # Update or insert into DynamoDB
        if latest_record:
            # Delete the old record
            # need to delete instead of updating the record and then adding
            # because email is the primary key within the dynamo db table
            # so can't be deleted straight away
            table.delete_item(
                Key={'email': prev_email, 'name': prev_name}
            )

            # Insert the new record
            table.put_item(
                Item={
                    'email': new_email,
                    'name': new_name,
                    'phone_number': new_phone
                }
            )
            return jsonify({"message": "User details updated successfully"}), 200
        else:
            # Insert the new record
            table.put_item(
                Item={
                    'email': new_email,
                    'name': new_name,
                    'phone_number': new_phone
                }
            )
            return jsonify({"message": "User details inserted successfully"}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500






def handler(event,context):
    
    return awsgi.response(app,event,context)