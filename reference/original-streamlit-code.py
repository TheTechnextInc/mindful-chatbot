import streamlit as st
import requests
import urllib.parse

sonar_API_KEY = "your_sonar_api_key_here"

def get_sonar_response(user_message):
    url = "https://api.sonar.ai/chat/completions"
    headers = {
        "Authorization": f"Bearer {sonar_API_KEY}",
        "Content-Type": "application/json",
        "accept": "application/json"
    }
    json_data = {
        "model": "sonar-pro",
        "messages": [
            {"role": "user", "content": f"You are a compassionate mental health assistant. {user_message}"}
        ]
    }
    response = requests.post(url, headers=headers, json=json_data)
    if response.status_code == 200:
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()
    else:
        return f"Error: {response.status_code} - {response.text}"

st.title("Mental Health Chatbot with sonar API")

if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

user_input = st.chat_input("Talk to the chatbot about your feelings or mental health:")

if user_input:
    st.session_state.chat_history.append({"role": "user", "message": user_input})
    reply = get_sonar_response(user_input)
    st.session_state.chat_history.append({"role": "assistant", "message": reply})

for chat in st.session_state.chat_history:
    if chat["role"] == "user":
        with st.chat_message("user"):
            st.markdown(chat["message"])
    else:
        with st.chat_message("assistant"):
            st.markdown(chat["message"])
            # Create WhatsApp link to share bot message
            wa_message = urllib.parse.quote(chat["message"])
            wa_link = f"https://wa.me/?text={wa_message}"
            st.markdown(f"[Send to WhatsApp]({wa_link})", unsafe_allow_html=True)
