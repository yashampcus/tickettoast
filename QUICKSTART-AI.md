# 🚀 Quick Start Guide - AI Appeal System

## Installation (5 minutes)

### 1. Install Ollama

```bash
# Download from https://ollama.ai/download or:
winget install Ollama.Ollama
```

### 2. Pull AI Model

```bash
ollama pull llama3.1
# This downloads ~4.7GB - takes 5-10 minutes
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Everything

```bash
# Terminal 1 - Ollama (if not auto-started)
ollama serve

# Terminal 2 - Your App
npm run dev
```

## Usage Flow

1. **Upload Citation** → PDF/JPG/PNG
2. **Process Document** → Extract fields
3. **Generate AI Appeal** → Click purple "Generate AI Appeal" button
4. **Review Results**:
   - Citation Analysis
   - Appeal Strategies (ranked)
   - Generated Letter
   - Quality Review
5. **Copy Letter** → Use in your appeal
6. **Auto-Fill Form** (optional) → Playwright automation

## What You Get

### Multi-Agent System

- **Analyst**: Evaluates citation completeness & appealability
- **Strategist**: Generates 3 ranked appeal strategies
- **Writer**: Drafts professional appeal letter
- **Reviewer**: Scores quality & suggests improvements

### Features

✅ **100% Free** - No API costs
✅ **Private** - Data stays on your machine
✅ **No Rate Limits** - Use unlimited
✅ **Offline** - Works without internet
✅ **Multi-Strategy** - Get multiple appeal approaches
✅ **Quality Scoring** - AI reviews its own work

## File Structure

```
src/
├── lib/agents/
│   ├── analyst.ts       # Citation analysis
│   ├── strategist.ts    # Strategy generation
│   ├── writer.ts        # Appeal writing
│   └── reviewer.ts      # Quality review
├── app/api/
│   └── ai-appeal/
│       └── route.ts     # Main API endpoint
└── components/
    └── DocumentUpload.tsx # UI with AI button
```

## Troubleshooting

### Ollama Not Found

```bash
ollama --version
# If error, restart terminal or reinstall
```

### Model Not Downloaded

```bash
ollama list
# If empty:
ollama pull llama3.1
```

### Connection Error

```bash
# Check Ollama is running:
ollama serve
# Or restart it
```

## Tips

- **First generation**: Takes 30-60s (loading model)
- **Next generations**: 3-10s (much faster)
- **Better results**: Use llama3.1:70b (if you have 32GB RAM)
- **Faster results**: Use phi3 (smaller model)

## Example Output

```
📊 Citation Analysis
- Completeness: Complete
- Violation: Parking meter expired
- Appealability: Medium
- Severity: Minor

🎯 Strategies (3 found)
1. Meter Malfunction (75% success)
2. Signage Confusion (60% success)
3. Emergency Circumstances (45% success)

✍️ Appeal Letter Generated (450 words)
✅ Quality Score: 87/100
```

## Next Steps

1. Test with a real citation
2. Customize agent prompts (see AI-SETUP.md)
3. Try different models
4. Integrate with local form systems

---

**Ready to appeal with AI!** 🎯
