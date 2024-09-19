from openai import OpenAI



def get_completion(prompt, model="gpt-3.5-turbo-1106"):
    client = OpenAI(
        api_key="sk-TXfP82zZiFDgRjuhB9091099C97f46579c552e82A9F6B99d",
    base_url = 'https://api.chat-plus.net/v1'
    )
    messages = [{"role": "user", "content": prompt}]
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.7,
    )
    return response.choices[0].message.content

prompt = "你好，ChatGPT！"

print(get_completion(prompt))
