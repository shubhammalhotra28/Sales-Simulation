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
def postToDB():

        return jsonify({'message': 'Data stored successfully'}), 200

        
    

def handler(event,context):
    
    return awsgi.response(app,event,context)
