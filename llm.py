from langchain.chat_models import init_chat_model
from dotenv import load_dotenv

load_dotenv()
model = init_chat_model("groq:openai/gpt-oss-20b")

if __name__ == "main":
    response = model.invoke("What is Ai?")
    print(response.content)

