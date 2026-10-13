from langchain.chat_models import init_chat_model
from dotenv import load_dotenv


load_dotenv()
model = init_chat_model("groq:openai/gpt-oss-120b")