# autoblog.py
# AI-powered blog writer for MillionairAI

import openai
import os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("GPT_API_KEY")

def generate_blog(topic):
    prompt = f"Write a high-quality, SEO-optimized blog post about: {topic}. Include H2 headers, bullet points, and a strong intro and conclusion. Keep it affiliate-friendly."

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a marketing AI that writes SEO blog posts for MillionairAI.com."},
            {"role": "user", "content": prompt}
        ]
    )

    return response['choices'][0]['message']['content']

if __name__ == "__main__":
    topic = input("Enter a topic for the blog: ")
    blog_post = generate_blog(topic)

    with open(f"blog_{topic.replace(' ', '_')}.md", "w") as f:
        f.write(blog_post)

    print("✅ Blog post saved.")
