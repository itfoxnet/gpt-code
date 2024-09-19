import requests
from openai import OpenAI
import openai

# 替换为你的 Base URL 和 API Key
base_url_1 = "https://api.chat-plus.net/v1"
api_key_1 = "sk-TXfP82zZiFDgRjuhB9091099C97f46579c552e82A9F6B99d"

base_url_2 = "https://api.gptapi.us/v1"
api_key_2 = "sk-qQdzsNrClcrqovwoCd32Ec2a54A24431974bA26a6b3bBa62"

# 定义请求内容
submitted_prompt = [
    {
        "role": "system",
        "content": '''
        You are an expert Tailwind developer
        You take detailed description of a reference web page from the user, and then build single page apps 
        using Tailwind, HTML and JS.

        - Make sure the app looks exactly like the detailed description.
        - Focus on the user's brief keywords in the description to generate the code accordingly.
        - Pay close attention to background color, text color, font size, font family, 
        padding, margin, border, etc. Match the colors and sizes exactly.
        - Do not add comments in the code such as "<!-- Add other navigation links as needed -->" and "<!-- ... other news items ... -->" in place of writing the full code. WRITE THE FULL CODE.
        - Repeat elements as needed to match the detailed description. For example, if there are 15 items, the code should have 15 items. DO NOT LEAVE comments like "<!-- Repeat for each news item -->" or bad things will happen.
        - For images, use placeholder images from /placeholder.svg and include a detailed description of the image in the alt text so that an image generation AI can generate the image later.

        In terms of libraries,

        - Use this script to include Tailwind: <script src="https://cdn.tailwindcss.com"></script>
        - You can use Google Fonts
        - Font Awesome for icons: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"></link>

        Code can be modified locally,

        - Can use the element attribute data-uid="$id" to find the element and modify it.
        - If need to delete, Delete the element use attribute data-uid="$id" like so:
        input:
        <div>
            <h2>*</h2>
            <div data-uid="$id">
              ****
            </div>
        </div>

        output:
        <div>
            <h2>*</h2>
        </div>

        Return only the full code in <html></html> tags.
        Do not include markdown "```" or "```html" at the start or end.
        Generate a webpage based on the user's input and directly return the complete code without asking the user for more details.
        Do not ask the user for more details.
        '''
    },
    {
        "role": "user",
        "content": [
            {"type": "text", "text": "生成一个谷歌首页"}
        ]
    }
]

# 定义函数调用 OpenAI API
# 定义函数调用 OpenAI API
def call_openai_api_old(base_url, api_key, prompt, model_name):
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    data = {
        "model": model_name,  # 在这里设置模型名称
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ]
    }
    
    try:
        response = requests.post(f"{base_url}/chat/completions", headers=headers, json=data)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except requests.exceptions.HTTPError as http_err:
        return f"HTTP error occurred: {http_err}"
    except Exception as err:
        return f"Other error occurred: {err}"
    
# 使用 OpenAI API 调用 GPT 模型
def call_openai_api(base_url, api_key, prompt, model_name):
    openai.api_key = api_key
    openai.api_base = base_url  # 修改 base URL
    print(openai.api_base)
    response = openai.completions.create(
        model = model_name,  # 在这里设置模型名称
        prompt=prompt,
    )
    
    # 返回生成的内容
    # 输出生成的结果
    return response.choices[0].message["content"]
    #return response['choices'][0]['message']['content']

def call_openai_api_new(base_url, api_key, prompt, model_name):
    client = OpenAI(
        api_key  = api_key,
        base_url = base_url,
    )
    messages = [{"role": "user", "content": prompt}]
    response = client.chat.completions.create(
        model=model_name,
        messages=prompt,
        temperature = 0.7
    )  
    return response.choices[0].message.content

def get_completion(base_url, api_key, prompt, model="gpt-4o-2024-05-13"):
    client = OpenAI(
        api_key=api_key,
        base_url = base_url
    )
    messages = [{"role": "user", "content": prompt}]
    response = client.chat.completions.create(
        model=model,
        messages=prompt,
        temperature=0.7,
    )
    return response.choices[0].message.content

prompt = "你好，ChatGPT！"


# 测试调用
#prompt = "Tell me a joke."
prompt = submitted_prompt
#print(get_completion(base_url_2, api_key_2, prompt))

model_name = "gpt-3.5-turbo"  # 在这里设置你想使用的模型名称
model_name = "gpt-4o-2024-05-13" 
model_name = "gpt-3.5-turbo-1106"
model_name = "gpt-4o-2024-08-06"
model_name = "o1-preview-2024-09-12" 
model_name = "gpt-4o-2024-08-06"	
print("Testing with Base URL 1:")
result_1 = call_openai_api_new(base_url_2, api_key_2, prompt, model_name)
print(result_1)
exit()
print("\nTesting with Base URL 2:")
result_2 = call_openai_api_new(base_url_2, api_key_2, prompt, model_name)
print(result_2)

