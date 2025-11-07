import json
import re

def fix_spacing(text):
    # Fix common spacing issues
    
    # Fix words joined with "the"
    text = re.sub(r'the([a-z])', r'the \1', text)
    
    # Fix words joined with "API"
    text = re.sub(r'API([A-Za-z])', r'API \1', text)
    
    # Fix other common patterns
    text = re.sub(r'([a-z])([A-Z][a-z])', r'\1 \2', text)
    
    # Fix specific cases
    replacements = {
        "exposeAPIs": "expose APIs",
        "APIGateway": "API Gateway",
        "APIcall": "API call",
        "APIcalls": "API calls",
        "CloudFormation": "Cloud Formation",
        "CloudFormationtemplates": "Cloud Formation templates",
        "CloudTrail": "Cloud Trail",
        "CloudFront": "Cloud Front",
        "CloudWatch": "Cloud Watch",
        "DynamoDB": "Dynamo DB",
        "ElastiCache": "Elasti Cache",
        "EventBridge": "Event Bridge",
        "CodeDeploy": "Code Deploy",
        "CodePipeline": "Code Pipeline",
        "CodeBuild": "Code Build",
        "CodeCommit": "Code Commit",
        "IAMusers": "IAM users",
        "IAMuser": "IAM user",
        "IAMpolicy": "IAM policy",
        "IAMrole": "IAM role",
        "1AM": "IAM",  # Fix common OCR error
        "1AMusers": "IAM users",
        "thenticate": "then ticate",
        "thenticated": "then ticated",
        "thentication": "then tication",
        "othe r": "other",
        "the ir": "their",
        "the se": "these",
        "the n": "then",
        "whethe r": "whether",
        "furthe r": "further",
        "rathe r": "rather",
        "tothe ": "to the ",
        "forthe ": "for the ",
        "inthe ": "in the ",
        "onthe ": "on the ",
        "fromthe ": "from the ",
        "withthe ": "with the ",
        "andthe ": "and the ",
        "ofthe ": "of the ",
        "eithe r": "either",
        "togethe r": "together",
        "anothe r": "another",
        "My SQL": "MySQL",
        "Postgre SQL": "PostgreSQL",
        "Saa S": "SaaS",
        "Id P": "IdP",
    }
    
    for old, new in replacements.items():
        text = text.replace(old, new)
    
    return text

# Load the JSON file
file_path = 'public/developerQuestions.json'
with open(file_path, 'r') as file:
    data = json.load(file)

# Fix spacing issues in questions and possible answers
for item in data:
    item['question'] = fix_spacing(item['question'])
    
    # Also fix possible answers
    if 'possibleAnswers' in item:
        for i, answer in enumerate(item['possibleAnswers']):
            item['possibleAnswers'][i] = fix_spacing(answer)

# Save the corrected JSON back to the file
with open(file_path, 'w') as file:
    json.dump(data, file, indent=2)

print("JSON file has been fixed and saved.")
