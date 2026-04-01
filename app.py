import streamlit as st
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import PyPDF2

# Page config
st.set_page_config(
    page_title="Resume Screening AI",
    page_icon="📄",
    layout="wide"
)

# Custom CSS
st.markdown("""
    <style>
    .main {
        background-color: #f5f7fa;
    }
    .stTextArea textarea {
        border-radius: 10px;
    }
    .stButton>button {
        background-color: #4CAF50;
        color: white;
        border-radius: 10px;
        height: 3em;
        width: 100%;
        font-size: 16px;
    }
    </style>
""", unsafe_allow_html=True)

# Title
st.title("📄 Smart Resume Screening AI")
st.write("Upload resumes or paste text to find best candidates 🚀")

# Layout
col1, col2 = st.columns(2)

with col1:
    job_description = st.text_area("📌 Job Description")

with col2:
    uploaded_files = st.file_uploader(
        "📄 Upload Resumes (PDF)",
        type=["pdf"],
        accept_multiple_files=True
    )

# Extract text from PDF
def extract_text_from_pdf(file):
    text = ""
    pdf_reader = PyPDF2.PdfReader(file)
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

# Button
analyze = st.button("🔍 Analyze Resumes")

if analyze:

    resumes = []

    # Get text from PDFs
    if uploaded_files:
        for file in uploaded_files:
            text = extract_text_from_pdf(file)
            resumes.append(text)

    # If no files uploaded
    if not resumes:
        st.warning("⚠️ Please upload at least one resume")
    else:

        # TF-IDF
        vectorizer = TfidfVectorizer()
        all_text = resumes + [job_description]
        tfidf_matrix = vectorizer.fit_transform(all_text)

        # Similarity
        similarity = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1])
        scores = similarity[0]

        # DataFrame
        results = pd.DataFrame({
            'Resume': resumes,
            'Score': scores
        })

        # Skill extraction
        skills = ["python", "machine learning", "data analysis", "java", "html", "css"]

        def extract_skills(text):
            found = []
            text = text.lower()
            for skill in skills:
                if skill in text:
                    found.append(skill)
            return found

        results['Skills'] = results['Resume'].apply(extract_skills)

        # Sort
        results = results.sort_values(by='Score', ascending=False)

        st.subheader("🏆 Top Candidates")

        # Display with progress bars
        for i, row in results.iterrows():
            score_percent = round(row['Score'] * 100, 2)

            st.markdown(f"### 🧑 Candidate {i+1}")
            st.progress(score_percent / 100)

            st.write(f"📊 Match Score: {score_percent}%")
            st.write(f"🛠 Skills: {', '.join(row['Skills']) if row['Skills'] else 'None'}")

            st.markdown("---")