# PUCIT GPA Assistant

A conversational GPA assistant for PUCIT BS(CS) students. It helps with grade points, semester GPA, CGPA, required GPA for a target CGPA, courses, credit hours, and GPA planning.

# Features

* Convert marks into PUCIT grade points
* Calculate semester GPA
* Calculate new CGPA
* Calculate required GPA for a target CGPA
* View semester courses and credit hours
* Calculate remaining credit hours
* Save GPA/CGPA reports

# Setup

Clone or download the project and open the project folder:

```bash
cd Assignment1
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install the required packages:

```bash
pip install -r requirements.txt
```

Create a `.env` file and add your Groq API key:

```env
GROQ_API_KEY=your_api_key_here
```

# Run

Run the agent with:

```bash
python agent.py
```

Then enter your questions in the terminal.

Example:

```text
You: I got 82 marks. What is my grade point?

Agent: Your 82 marks correspond to a grade point of 3.7.
```

Type `exit` or `quit` to close the program.

# Notes

The agent uses tools for GPA and CGPA calculations instead of performing the calculations directly. It is designed specifically for PUCIT BS(CS) GPA and academic guidance.
