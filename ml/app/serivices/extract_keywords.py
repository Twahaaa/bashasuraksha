from google import genai

def extract_keywords(self, text):
    response = self.gemini_client.models.generate_content(
        model="gemini-2.5-pro",
        contents=f"Extract keywords from this text:\n{text}"
    )
    return response.text
