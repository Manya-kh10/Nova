import os
import base64
import json
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
CREDENTIALS_PATH = "E:/Nova/backend/credentials.json"
TOKEN_PATH = "E:/Nova/backend/token.json"

def get_gmail_service():
    creds = None
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_PATH, 'w') as token:
            token.write(creds.to_json())
    return build('gmail', 'v1', credentials=creds)


def get_header(headers, name):
    for h in headers:
        if h['name'].lower() == name.lower():
            return h['value']
    return ''


def fetch_important_emails(max_results: int = 20):
    try:
        service = get_gmail_service()
        results = service.users().messages().list(
            userId='me',
            labelIds=['INBOX'],
            q='is:unread',
            maxResults=max_results
        ).execute()

        messages = results.get('messages', [])
        emails = []

        for msg in messages:
            m = service.users().messages().get(
                userId='me', id=msg['id'], format='metadata',
                metadataHeaders=['From', 'Subject', 'Date']
            ).execute()

            headers = m.get('payload', {}).get('headers', [])
            snippet = m.get('snippet', '')
            labels = m.get('labelIds', [])

            emails.append({
                'id': msg['id'],
                'from': get_header(headers, 'From'),
                'subject': get_header(headers, 'Subject'),
                'date': get_header(headers, 'Date'),
                'snippet': snippet,
                'important': 'IMPORTANT' in labels,
                'unread': 'UNREAD' in labels
            })

        return emails
    except Exception as e:
        return {"error": str(e)}

def classify_email(email: dict) -> str:
    from_addr = email['from'].lower()
    subject = email['subject'].lower()
    snippet = email['snippet'].lower()
    combined = f"{from_addr} {subject} {snippet}"

    # College
    if 'vitbhopal.ac.in' in from_addr or 'neopats' in combined or 'vit bhopal' in combined:
        return 'college'

    # Hackathons
    hackathon_keywords = ['hackathon', 'devpost', 'unstop', 'mlh', 'hack the', 'codefest', 'cto']
    if any(k in combined for k in hackathon_keywords):
        return 'hackathons'

    # Jobs / Internships
    job_keywords = ['internship', 'job alert', 'hiring', 'we work remotely', 'career', 'recruiter', 'job opening', 'apply now', 'shortlisted', 'interview']
    if any(k in combined for k in job_keywords):
        return 'jobs'

    return 'others'


def categorize_emails(emails: list) -> dict:
    categories = {'college': [], 'jobs': [], 'hackathons': [], 'others': []}
    for email in emails:
        category = classify_email(email)
        email['category'] = category
        categories[category].append(email)
    return categories

def fetch_all_unread():
    emails = fetch_important_emails(max_results=30)
    if isinstance(emails, dict) and 'error' in emails:
        return emails
    return categorize_emails(emails)