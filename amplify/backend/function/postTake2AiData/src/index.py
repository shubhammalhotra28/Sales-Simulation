from flask import Flask, jsonify, request
import boto3
from boto3.dynamodb.conditions import Key
import requests
import awsgi  # Import awsgi module for AWS Lambda integration

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('userDatabaseDDB-dev')

# Base route for API endpoints
BASE_ROUTE = "/postTake2AiData"

app = Flask(__name__)

# Endpoint to handle POST requests for saving form data
@app.route(BASE_ROUTE, methods=["POST"])
def postToDB():
    try:
        # Extract data from request
        request_json = request.get_json()

        # data = request.json

        # if data == None:
        #     print("data is None")
        #     return jsonify({'error':'Data is having an issue'}), 400

        # email = str(args.get("email"))
        # name = str(args.get("name"))
        # phone_number = str(args.get("phone_number"))
        # s3_url = str(args.get("s3_url"))

        name = request_json.get("name")
        phone_number = request_json.get("phone_number")
        s3_url = request_json.get("s3_url")
        email = request_json.get("email")


        # Fetch audio content from S3
        audio_response = requests.get(s3_url)
        print('audio response = ',audio_response)
        if audio_response.status_code != 200:
            print('audio done')
            error_message = f"Failed to download audio from S3: {audio_response.status_code} - {audio_response.text}"
            print(error_message)  # Log the error for debugging
            return jsonify({'error': error_message}), 500

        # Transcribe audio using OpenAI Whisper API
        headers = {
            'Authorization': 'Bearer sk-proj-8yhRgYLVQno8MT8x5hXeT3BlbkFJCZLs9WHONPRB00bmrpNG',  # Replace with your actual API key
        }
        files = {
            'file': ('audio.mp3', audio_response.content),
        }
        transcribe_data = {
            'model': 'whisper-1',  # Example model, update according to your needs
        }
        response = requests.post('https://api.openai.com/v1/audio/transcriptions', headers=headers, files=files, data=transcribe_data)

        print('opern_ai response = ',response)

        if response.status_code == 200:
            audio_text = response.json().get('text', '')
        else:
            error_message = f"Failed to process audio: {response.status_code} - {response.text}"
            print(error_message)  # Log the error for debugging
            return jsonify({'error': 'Failed to process audio'}), 500

        # Generate feedback and score from the transcribed text using OpenAI API
        feedback_data = {
            'model': 'gpt-3.5-turbo',
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are a helpful assistant.'
                },
                {
                    'role': 'user',
                    'content': f"Please provide feedback and a score on a scale of 1 to 10 for the following text: {audio_text}. Format the response as 'Score: X out of 10. Feedback: ...'"
                }
            ],
            'max_tokens': 100
        }
        response = requests.post('https://api.openai.com/v1/chat/completions', headers=headers, json=feedback_data)

        if response.status_code == 200:
            feedback_response = response.json().get('choices', [])[0].get('message', {}).get('content', '')
            try:
                score_str = feedback_response.split('Score:')[1].split('out of 10')[0].strip()
                score = int(score_str)
                feedback = feedback_response.split('Feedback:')[1].strip()
            except (IndexError, ValueError) as e:
                error_message = f"Failed to parse feedback response: {feedback_response} - {str(e)}"
                print(error_message)  # Log the error for debugging
                return jsonify({'error': 'Failed to parse feedback response'}), 500
        else:
            error_message = f"Failed to generate feedback: {response.status_code} - {response.text}"
            print(error_message)  # Log the error for debugging
            return jsonify({'error': 'Failed to generate feedback'}), 500


        # Prepare submission tuple
        submission_tuple = {
            's3_url': s3_url,
            'actual_text': audio_text,
            'feedback': feedback,
            'score': score
        }

        # Query DynamoDB to retrieve the latest record for the email and name
        response = table.query(
            KeyConditionExpression=Key('email').eq(email) & Key('name').eq(name),
            ScanIndexForward=False,  # Get the latest record first
            Limit=1
        )
        latest_record = response.get('Items', [])[0] if response.get('Items') else None

        # Update or insert into DynamoDB
        if latest_record:
            # Append new submission to existing submissions list
            submissions = latest_record.get('submissions', [])
            submissions.append(submission_tuple)
            table.update_item(
                Key={'email': email, 'name': name},
                UpdateExpression='SET submissions = :sub',
                ExpressionAttributeValues={':sub': submissions}
            )
        else:
            # Create new record if no previous record found
            item = {
                'name': name,
                'email': email,
                'phone_number': phone_number,
                'submissions': [submission_tuple]
            }
            table.put_item(Item=item)

        return jsonify({'message': 'Data stored successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
        
    

def handler(event,context):
    
    return awsgi.response(app,event,context)
