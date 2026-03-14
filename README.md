# NeuroLingo 

**NeuroLingo** is a lightweight, responsive web application built with Python and Flask that provides seamless language translation. It offers a clean and intuitive user interface to translate text between various global and regional languages.

 **Live Demo:** [neurolingo.onrender.com](https://neurolingo.onrender.com)

## Features
- **Auto-Detect Source Language:** Automatically detects the language you are typing in.
- **Multilingual Support:** Supports translation across 19+ languages, including English, Spanish, French, Hindi, Chinese, Arabic, and more.
- **Real-Time API Integration:** Powered by the MyMemory Translation API for quick and accurate translations.
- **Responsive UI:** Built with custom CSS and HTML for a smooth experience across both desktop and mobile devices.

## Tech Stack
This project leverages a combination of frontend and backend technologies:
- **Backend:** Python (Flask), `requests` for API handling
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Deployment:** Render 

*Language Composition:* CSS (47.3%), JavaScript (25.9%), HTML (19.9%), Python (6.9%)

## Getting Started

To run NeuroLingo locally on your machine, follow these steps:

### Prerequisites
- Python 3.7 or higher
- `pip` (Python package manager)

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/techwithsuryansh/NeuroLingo.git
   cd NeuroLingo
   ```

2. **Install the required dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Flask application:**
   ```bash
   python app.py
   ```

4. **Access the app:**
   Open your browser and navigate to `http://localhost:5000/`.

## Project Structure
```text
NeuroLingo/
│
├── static/             # CSS and JavaScript files
├── templates/          # HTML templates (index.html)
├── app.py              # Main Flask application file
├── requirements.txt    # Python dependencies
└── README.md           # Project documentation
```

## Contributing
Contributions, issues, and feature requests are welcome! 
Feel free to check out the [issues page](https://github.com/techwithsuryansh/NeuroLingo/issues) if you want to contribute.

## License
This project is open-source and available under the MIT License.
