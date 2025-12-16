import sys
import os

print(f"Python Executable: {sys.executable}")
print(f"Python Version: {sys.version}")
print("Sys Path:")
for p in sys.path:
    print(p)

try:
    import sentence_transformers
    print(f"Sentence Transformers Location: {sentence_transformers.__file__}")
except ImportError as e:
    print(f"Import Error: {e}")

try:
    import google.generativeai
    print(f"Gemini Location: {google.generativeai.__file__}")
except ImportError as e:
    print(f"Gemini Import Error: {e}")
