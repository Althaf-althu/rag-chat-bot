import os
import json
from typing import AsyncGenerator

from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv()


class ChatService:
    def __init__(self):
        self.api_key = os.getenv("HF_API_KEY")
        self.default_model = os.getenv(
            "HF_MODEL_ID",
            "meta-llama/Llama-3.1-8B-Instruct"
        )

    async def stream_chat_response(
        self,
        prompt: str,
        model_id: str = None
    ) -> AsyncGenerator[str, None]:

        target_model = model_id or self.default_model

        if not self.api_key:
            yield (
                "data: "
                + json.dumps(
                    {
                        "error": "HF_API_KEY environment variable missing."
                    }
                )
                + "\n\n"
            )
            return

        try:
            client = InferenceClient(
                api_key=self.api_key
            )

            response = client.chat.completions.create(
                model=target_model,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=1024
            )

            generated_text = response.choices[0].message.content

            words = generated_text.split(" ")

            for idx, word in enumerate(words):
                spacer = " " if idx < len(words) - 1 else ""

                yield (
                    "data: "
                    + json.dumps(
                        {
                            "token": word + spacer
                        }
                    )
                    + "\n\n"
                )

            yield "data: [DONE]\n\n"

        except Exception as e:
            yield (
                "data: "
                + json.dumps(
                    {
                        "error": f"Hugging Face request failed: {str(e)}"
                    }
                )
                + "\n\n"
            )

            yield "data: [DONE]\n\n"