# 🤖 AI Appeal Generation Setup Guide

This guide will help you set up the free, local AI appeal generation system using Ollama.

## Prerequisites

- Windows 10/11
- At least 8GB RAM (16GB recommended)
- 10GB free disk space for AI models

## Step 1: Install Ollama

### Option A: Windows Installer (Recommended)

1. Go to https://ollama.ai/download
2. Download the Windows installer
3. Run the installer and follow prompts
4. Ollama will start automatically

### Option B: Command Line

```bash
winget install Ollama.Ollama
```

### Verify Installation

```bash
ollama --version
```

## Step 2: Download AI Models

Open PowerShell or Command Prompt and run:

```bash
# Download Llama 3.1 (recommended - 4.7GB)
ollama pull llama3.1

# Or download smaller/faster alternatives:
ollama pull mistral      # 4.1GB - Fast and efficient
ollama pull phi3         # 2.3GB - Compact but capable

# Verify models are installed
ollama list
```

## Step 3: Install Node Dependencies

```bash
cd C:\Users\YashWaikar\ticket\tickettoast
npm install langchain @langchain/community
```

## Step 4: Configure Environment

Add to your `.env` file:

```env
# Ollama Configuration (Optional - these are defaults)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

## Step 5: Start Ollama Server

Ollama should start automatically. If not, run:

```bash
ollama serve
```

Keep this terminal window open while using the app.

## Step 6: Test the Setup

### Test Ollama Directly

```bash
ollama run llama3.1 "Write a brief parking ticket appeal."
```

### Test via API

```bash
curl http://localhost:11434/api/generate -d "{\"model\": \"llama3.1\", \"prompt\": \"Hello\"}"
```

## Step 7: Start Your App

```bash
npm run dev
```

Navigate to http://localhost:3002 and:

1. Upload a parking citation
2. Process the document
3. Click "Generate AI Appeal"

## Usage

### Workflow

1. **Upload** parking citation (PDF, JPG, PNG)
2. **Extract** fields using Google Cloud Document AI
3. **Generate AI Appeal** using local Ollama models
4. **Review** the multi-agent analysis:
   - Citation analysis
   - Appeal strategies (ranked by success probability)
   - Generated appeal letter
   - Quality review with suggestions
5. **Copy** the appeal letter and customize if needed
6. **Use Playwright** to auto-fill the online form

### Multi-Agent System

The system uses 4 specialized AI agents:

1. **Analyst Agent** 📊
   - Analyzes citation completeness
   - Identifies violation type
   - Assesses appealability

2. **Strategy Agent** 🎯
   - Generates 3 ranked appeal strategies
   - Suggests required evidence
   - Estimates success probability

3. **Writer Agent** ✍️
   - Drafts professional appeal letter
   - Uses selected strategy
   - Maintains respectful tone

4. **Reviewer Agent** ✅
   - Reviews letter quality (0-100 score)
   - Identifies strengths/weaknesses
   - Suggests improvements

## Model Comparison

| Model        | Size  | Speed     | Quality   | RAM Needed |
| ------------ | ----- | --------- | --------- | ---------- |
| llama3.1     | 4.7GB | Medium    | High      | 8GB        |
| mistral      | 4.1GB | Fast      | Good      | 8GB        |
| phi3         | 2.3GB | Very Fast | Decent    | 4GB        |
| llama3.1:70b | 40GB  | Slow      | Excellent | 32GB       |

### Recommended Model

- **Development**: `phi3` (fast iteration)
- **Production**: `llama3.1` (best quality)
- **High-end**: `llama3.1:70b` (if you have the hardware)

## Switching Models

To use a different model:

1. Pull the model:

```bash
ollama pull mistral
```

2. Update `.env`:

```env
OLLAMA_MODEL=mistral
```

3. Restart your app

## Troubleshooting

### "Ollama not found" Error

- Make sure Ollama is installed: `ollama --version`
- Restart your terminal
- Check PATH: Ollama should be in `C:\Users\<username>\AppData\Local\Programs\Ollama`

### "Connection refused" Error

- Start Ollama server: `ollama serve`
- Check if running: `curl http://localhost:11434`
- Check firewall settings

### "Model not found" Error

- Pull the model: `ollama pull llama3.1`
- Verify: `ollama list`

### Slow Generation

- Use a smaller model: `ollama pull phi3`
- Close other applications
- Ensure SSD for model storage
- Consider using GPU acceleration

### Poor Quality Appeals

- Use a larger model: `ollama pull llama3.1:70b`
- Provide more citation details
- Add user context in the appeal generation

## Performance Tips

1. **First Run**: Models take time to load (30-60 seconds)
2. **Subsequent Runs**: Much faster (3-10 seconds)
3. **Keep Ollama Running**: Don't stop the server between uses
4. **GPU Acceleration**: Ollama automatically uses NVIDIA/AMD GPUs if available
5. **RAM**: More RAM = better performance

## Cost Comparison

| Service            | Cost                          |
| ------------------ | ----------------------------- |
| OpenAI GPT-4       | $0.03 per appeal (~$30/1000)  |
| Anthropic Claude   | $0.015 per appeal (~$15/1000) |
| **Ollama (Local)** | **$0.00 (FREE!)**             |

## Privacy & Security

✅ **Completely Private**: Data never leaves your machine  
✅ **No API Keys**: No external services required  
✅ **Offline Capable**: Works without internet (after model download)  
✅ **No Tracking**: No usage analytics or data collection

## Advanced Configuration

### Custom System Prompts

Edit the agent files in `src/lib/agents/` to customize:

- Analysis criteria
- Appeal strategies
- Writing style
- Review standards

### Temperature Settings

Adjust creativity/consistency in each agent:

- **Lower (0.2-0.4)**: More consistent, factual
- **Higher (0.7-0.9)**: More creative, varied

### Context Window

Llama 3.1 supports up to 128K tokens of context, allowing for very detailed citations.

## Next Steps

- Try different models to find your preference
- Customize agent prompts for your jurisdiction
- Add more evidence types (photos, witness statements)
- Integrate with your local parking authority's API

## Support

- Ollama Docs: https://ollama.ai/docs
- LangChain Docs: https://js.langchain.com/docs
- Issues: Create an issue in the GitHub repo

---

**You're now running a completely free, private AI system for parking ticket appeals!** 🎉
