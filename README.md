# GPA Assistant

GPA Assistant is a web-based academic assistant designed for BS Computer Science students at the University of the Punjab. It helps students calculate semester GPA, understand grade points, plan CGPA targets, explore semester courses, and receive AI-assisted academic guidance.

The application combines a Python backend, a web-based frontend, and an AI agent equipped with tools for academic calculations.

## Features

### GPA Calculator
- Convert marks into grade points using the configured grading scale.
- Calculate semester GPA using course credit hours.
- View total credit hours, total grade points, and course count.
- Display appropriate result messages for calculated GPA values.

### CGPA Planner
- Enter current CGPA and completed credit hours.
- Select the current semester and set a target CGPA.
- Calculate the required GPA across different semester horizons.
- Identify the earliest achievable target horizon.
- Check whether a target is achievable by graduation under the supplied assumptions.
- Receive an AI-generated explanation of the calculated plan.

### Course Information
- View courses for different semesters.
- Retrieve course codes, names, and credit hours from the backend.
- Calculate remaining credit hours based on the configured curriculum.

### AI GPA Assistant
- Ask questions about grade points, semester GPA, CGPA, and academic planning.
- Use dedicated tools for numerical calculations.
- Receive explanations and academic guidance relevant to PUCIT students.
- Generate reports through supported assistant functionality.

### Dashboard
- View current CGPA, completed credit hours, remaining credit hours, and target CGPA.
- Publish a selected CGPA plan to the dashboard explicitly.
- Retain the published plan after refreshing the browser.

### Reports
- Save supported GPA and CGPA reports.
- View previously saved reports.
- Download reports and delete saved reports.
- Store reports in browser local storage.

## Technology Stack

**Backend**
- Python
- FastAPI
- Pydantic
- LangChain
- Groq API

**Frontend**
- HTML5
- CSS3
- JavaScript
- Fetch API
- Browser Local Storage

**Development Tools**
- Uvicorn
- pip
- Python virtual environment
- FastAPI Swagger UI
- Visual Studio Code

## Project Structure

```text
GPA Assistant/
│
├── .env
├── .gitignore
├── README.md
├── requirements.txt
│
├── backend/
│   ├── Api/
│   │   ├── __init__.py
│   │   └── courses.py
│   │
│   ├── Assistant/
│   │   ├── __init__.py
│   │   ├── agent.py
│   │   ├── llm.py
│   │   └── tools.py
│   │
│   └── Schemas/
│       ├── __init__.py
│       └── Gpa.py
│
└── Frontend/
    ├── index.html
    ├── gpa-calculator.html
    ├── cgpa-planner.html
    ├── courses.html
    ├── assistant.html
    ├── reports.html
    ├── about.html
    │
    ├── css/
    │   └── style.css
    │
    └── js/
        ├── index.js
        ├── gpa-calculator.js
        ├── cgpa_planner.js
        ├── courses.js
        ├── courses_api.js
        ├── assistant.js
        └── reports.js
```

The structure above reflects the intended organization. Keep any additional files present in your actual project, including package initialization files.

## Prerequisites

Before running GPA Assistant, ensure you have:

- Python 3.10 or a compatible version supported by the installed dependencies.
- pip.
- A modern web browser.
- A Groq API key for AI-powered functionality.
- Visual Studio Code with the Live Server extension, or another local frontend server.

## Installation and Setup

### 1. Open the project directory

Clone the repository or download the project, then open its root directory in a terminal.

```bash
cd "GPA Assistant"
```

If you cloned the project from GitHub, use the actual repository URL and directory name.

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate the environment on Windows:

```powershell
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

Ensure `requirements.txt` contains the packages required by your implementation, including FastAPI, Uvicorn, Pydantic, LangChain, the relevant Groq integration, and `python-dotenv` where applicable.

### 4. Configure environment variables

Create a `.env` file in the project root and add your Groq API key:

```env
GROQ_API_KEY=your_api_key_here
```

Replace the placeholder with your actual API key.

Keep `.env` private and include it in `.gitignore`. Never commit API keys or other secrets to GitHub.

The model identifier configured in the application must be supported by the installed LangChain integration and your Groq account.

## Running the Application

### 1. Start the backend

Open a terminal in the project root and activate the virtual environment.

Then change into the backend directory:

```bash
cd backend
```

Start the FastAPI server:

```bash
uvicorn Api.courses:app --reload
```

The backend should now be available at:

`http://127.0.0.1:8000`

Keep this terminal open while using the application.

### 2. Open the API documentation

Visit:

`http://127.0.0.1:8000/docs`

FastAPI provides interactive API documentation where you can inspect endpoints, submit test requests, and examine responses.

### 3. Start the frontend

Open the `Frontend` folder in Visual Studio Code.

Right-click `index.html` and select **Open with Live Server**.

The frontend is expected to run at:

`http://127.0.0.1:5500`

If Live Server uses a different port, update the backend CORS configuration to allow the correct frontend origin.

Keep both the frontend and backend running while testing the application.

## API Endpoints

The backend provides the following endpoints, subject to the route definitions in `backend/Api/courses.py`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/courses` | Retrieve semester course information |
| POST | `/GPA` | Calculate semester GPA |
| POST | `/cgpa-plan` | Generate a CGPA plan |
| POST | `/assistant/chat` | Interact with the AI assistant |

Use `http://127.0.0.1:8000/docs` to inspect the actual request schemas and response formats.

### GPA Calculation

The GPA endpoint accepts a semester number and the marks for its courses.

Example request:

```json
{
  "sem": 6,
  "marks": [85, 78, 90, 72, 88, 65, 80]
}
```

These marks are illustrative. The number and ordering of marks must match the courses expected by the backend for the selected semester.

The response provides the calculated GPA, applicable total credit hours, total grade points, and course count, according to the implemented response schema.

### CGPA Planning

The CGPA planner accepts the student's current academic information and target CGPA.

Example request:

```json
{
  "current_cgpa": 3.1,
  "completed_credit_hours": 62,
  "current_semester": 5,
  "target_cgpa": 3.5
}
```

The example values are illustrative and must satisfy the application's validation rules.

The response can include the required GPA across different semester horizons, the first achievable horizon, target achievability by graduation, and an AI-generated explanation.

## Grading System

The application uses the grade-point thresholds configured in the backend.

| Marks | Grade Points |
|---|---:|
| 85–100 | 4.0 |
| 80–84 | 3.7 |
| 75–79 | 3.3 |
| 70–74 | 3.0 |
| 65–69 | 2.7 |
| 61–64 | 2.3 |
| 58–60 | 2.0 |
| 55–57 | 1.7 |
| 50–54 | 1.0 |
| Below 50 | 0.0 |

The backend implementation is the source of truth for grading thresholds and course inclusion rules.

### GPA Formula

Semester GPA is calculated using the weighted grade points of applicable courses:

\[
\text{GPA} =
\frac{\sum(\text{Grade Points}\times\text{Credit Hours})}
{\sum\text{Applicable Credit Hours}}
\]

Courses excluded under the configured grading rules must not contribute to the GPA numerator or denominator.

The CGPA planner uses the current CGPA, completed credit hours, target CGPA, and remaining credit hours to estimate the GPA needed to reach the target. Results depend on the supplied data and the assumptions implemented in the backend.

## Data Storage

The application uses browser local storage for the selected dashboard plan and saved reports.

- `pucitDashboardData` stores the CGPA plan explicitly selected for the dashboard.
- `gpaAssistantReports` stores saved reports displayed on the reports page.

Calculating a new plan does not automatically replace the published dashboard plan. The user must select **Show on Dashboard** to publish a plan.

These records are stored in the current browser and are not automatically synchronized across devices. Clearing browser storage may remove them.

## Troubleshooting

### Backend fails to start

- Confirm that the virtual environment is activated.
- Install the required packages.
- Run Uvicorn from the correct working directory.
- Check the terminal for import errors or missing dependencies.

### Frontend cannot connect to the backend

- Confirm that FastAPI is running on port 8000.
- Verify the API URLs in the JavaScript files.
- Check the backend's CORS configuration.
- Inspect the browser's Network and Console tabs.

### GPA results are incorrect

- Confirm that the marks correspond to the selected semester's courses.
- Verify that the number of marks matches the expected course count.
- Check the grade-point conversion and credit-hour mapping.
- Ensure excluded courses are handled consistently.

### AI assistant is unavailable

- Verify the Groq API key in `.env`.
- Check the configured model identifier and installed dependencies.
- Review backend logs for API errors, rate limits, or configuration issues.

### Dashboard values are missing

- Calculate a valid CGPA plan.
- Select **Show on Dashboard** to publish it.
- Confirm that `pucitDashboardData` exists in the browser's local storage.
- Verify that `index.js` is loaded and the dashboard HTML element IDs match the JavaScript.

## Development Notes

The application separates the frontend interface from backend academic calculations. The frontend collects input and displays results, while the backend manages course information, grading rules, calculations, and AI-assisted functionality.

The AI agent uses dedicated tools for supported numerical calculations rather than relying on the language model to calculate every result directly.

Future improvements may include automated unit tests, API integration tests, persistent server-side storage, improved validation, and deployment configuration.

