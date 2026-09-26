from langchain.chat_models import init_chat_model
from dotenv import load_dotenv

load_dotenv()
llm = init_chat_model("groq:openai/gpt-oss-20b")

response = llm.invoke("What is Ai?")
print(response.content)

