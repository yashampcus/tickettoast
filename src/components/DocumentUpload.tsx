"use client";

import React, { useState, useCallback } from "react";
import {
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  Sparkles,
  BarChart3,
  Target,
  PenTool,
  CheckSquare,
  Copy,
  Award,
  ClipboardList,
} from "lucide-react";
import { MultiStepLoader } from "./ui/multi-step-loader";
import { FileUpload } from "./ui/file-upload";
import { GlowingEffect } from "./ui/glowing-effect";
import { AIAgentProgress, getDefaultAgentSteps, type AgentStep } from "./ui/ai-agent-progress";

interface ExtractedField {
  label: string;
  value: string;
  confidence: number;
}

interface ProcessingResult {
  rawText: string;
  extractedFields: ExtractedField[];
  processingTime: number;
}

interface ErrorDetails {
  error: string;
  isConfigError: boolean;
  details: string;
  solution?: {
    step1: string;
    step2: string;
    step3: string;
    exampleSchema: any;
  };
  alternativeSolution?: string;
}

const loadingStates = [
  { text: "Uploading document to server..." },
  { text: "Authenticating with Google Cloud..." },
  { text: "Initializing Document AI processor..." },
  { text: "Analyzing document structure..." },
  { text: "Extracting text content..." },
  { text: "Identifying parking citation fields..." },
  { text: "Processing structured data..." },
  { text: "Processing complete!" },
];

export const DocumentUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
  const [isFillingForm, setIsFillingForm] = useState(false);
  const [formFillResult, setFormFillResult] = useState<any>(null);
  const [isGeneratingAppeal, setIsGeneratingAppeal] = useState(false);
  const [aiAppeal, setAiAppeal] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>(getDefaultAgentSteps());
  const [showAgentProgress, setShowAgentProgress] = useState(false);

  // Check localStorage on mount and when view changes (for history load)
  React.useEffect(() => {
    const loadFromStorage = () => {
      const savedResult = localStorage.getItem('tickettoast-result');
      const savedAiAppeal = localStorage.getItem('tickettoast-ai-appeal');
      const savedFormFill = localStorage.getItem('tickettoast-form-fill');
      
      if (savedResult) {
        try {
          setResult(JSON.parse(savedResult));
        } catch (e) {
          console.error('Failed to load saved result:', e);
        }
      }
      
      if (savedAiAppeal) {
        try {
          setAiAppeal(JSON.parse(savedAiAppeal));
        } catch (e) {
          console.error('Failed to load saved AI appeal:', e);
        }
      }
      
      if (savedFormFill) {
        try {
          setFormFillResult(JSON.parse(savedFormFill));
        } catch (e) {
          console.error('Failed to load saved form fill:', e);
        }
      }
    };

    // Load on mount
    loadFromStorage();

    // Also listen for custom event from history page
    const handleHistoryLoad = () => {
      loadFromStorage();
    };

    window.addEventListener('historyLoaded', handleHistoryLoad);
    return () => window.removeEventListener('historyLoaded', handleHistoryLoad);
  }, []);

  const handleFileChange = useCallback((files: File[]) => {
    const selectedFile = files[0];
    if (selectedFile) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Invalid file type. Please upload a PDF, JPG, or PNG file.");
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File too large. Please upload a file smaller than 10MB.");
        return;
      }

      setFile(selectedFile);
      setResult(null);
      setError(null);
      setErrorDetails(null);
    }
  }, []);

  const processDocument = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setErrorDetails(null);
    
    // Generate new session ID for this processing
    const newSessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const startTime = Date.now();
      const response = await fetch("/api/process-document", {
        method: "POST",
        body: formData,
      });

      const processingTime = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json();

        if (errorData.error === "Custom Extraction Processor Schema Missing") {
          setErrorDetails(errorData);
          throw new Error(
            "Processor configuration required - see details below"
          );
        }

        throw new Error(errorData.error || "Failed to process document");
      }

      const data = await response.json();

      const resultData = {
        rawText: data.text || "",
        extractedFields: data.extractedFields || [],
        processingTime,
      };
      
      setResult(resultData);
      
      // Save to localStorage
      localStorage.setItem('tickettoast-result', JSON.stringify(resultData));
      
      // Save to history
      const historyItem = {
        id: newSessionId,
        timestamp: Date.now(),
        result: resultData,
      };
      localStorage.setItem(`tickettoast-history-${newSessionId}`, JSON.stringify(historyItem));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while processing the document"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (extension === "pdf") {
      return <FileText className="w-8 h-8 text-red-500" />;
    } else if (["jpg", "jpeg", "png"].includes(extension || "")) {
      return <ImageIcon className="w-8 h-8 text-green-500" />;
    }
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setErrorDetails(null);
    setIsProcessing(false);
    setIsFillingForm(false);
    setFormFillResult(null);
    setIsGeneratingAppeal(false);
    setAiAppeal(null);
    
    // Clear localStorage
    localStorage.removeItem('tickettoast-result');
    localStorage.removeItem('tickettoast-ai-appeal');
    localStorage.removeItem('tickettoast-form-fill');
  };

  const generateAIAppeal = async () => {
    if (!result || !result.extractedFields) return;

    setIsGeneratingAppeal(true);
    setAiAppeal(null);
    setShowAgentProgress(true);
    setAgentSteps(getDefaultAgentSteps());

    try {
      const response = await fetch("/api/ai-appeal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          extractedFields: result.extractedFields,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate AI appeal");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response stream");
      }

      let buffer = "";
      let finalData: any = null;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          const eventMatch = line.match(/^event: (.+)$/m);
          const dataMatch = line.match(/^data: (.+)$/m);

          if (eventMatch && dataMatch) {
            const eventType = eventMatch[1];
            const data = JSON.parse(dataMatch[1]);

            if (eventType === "progress") {
              // Update the specific step
              setAgentSteps(steps => steps.map(s => {
                if (s.id === data.step) {
                  if (data.status === "in-progress") {
                    return { ...s, status: "in-progress" as const };
                  } else if (data.status === "complete") {
                    let resultPreview: any;
                    
                    if (data.step === "analyst") {
                      resultPreview = {
                        status: data.result.appealability,
                        count: data.result.violationType
                      };
                    } else if (data.step === "strategist") {
                      resultPreview = { count: `${data.result.length} strategies` };
                    } else if (data.step === "writer") {
                      resultPreview = `${data.result.length} characters`;
                    } else if (data.step === "reviewer") {
                      resultPreview = { score: data.result.score };
                    }

                    return {
                      ...s,
                      status: "complete" as const,
                      result: resultPreview,
                      duration: data.duration
                    };
                  }
                }
                return s;
              }));
            } else if (eventType === "complete") {
              finalData = data;
            } else if (eventType === "error") {
              throw new Error(data.details || data.error);
            }
          }
        }
      }

      // Wait a moment before showing final results
      await new Promise(resolve => setTimeout(resolve, 800));

      if (finalData) {
        setAiAppeal(finalData);
        setShowAgentProgress(false);

        // Save to localStorage
        localStorage.setItem('tickettoast-ai-appeal', JSON.stringify(finalData));

        // Update history with AI appeal
        if (sessionId) {
          const historyKey = `tickettoast-history-${sessionId}`;
          const existingHistory = localStorage.getItem(historyKey);
          if (existingHistory) {
            const historyItem = JSON.parse(existingHistory);
            historyItem.aiAppeal = finalData;
            localStorage.setItem(historyKey, JSON.stringify(historyItem));
          }
        }
      }
    } catch (err) {
      setAgentSteps(steps => steps.map(s => 
        s.status === 'in-progress' ? { ...s, status: 'error' as const } : s
      ));
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while generating appeal"
      );
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowAgentProgress(false);
    } finally {
      setIsGeneratingAppeal(false);
    }
  };

  const fillForm = async (previewMode: boolean = true) => {
    if (!result || !result.extractedFields) return;

    setIsFillingForm(true);
    setFormFillResult(null);

    try {
      const response = await fetch("/api/fill-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          extractedFields: result.extractedFields,
          previewMode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fill form");
      }

      const data = await response.json();
      setFormFillResult(data);
      
      // Save to localStorage
      localStorage.setItem('tickettoast-form-fill', JSON.stringify(data));
      
      // Update history with form fill
      if (sessionId) {
        const historyKey = `tickettoast-history-${sessionId}`;
        const existingHistory = localStorage.getItem(historyKey);
        if (existingHistory) {
          const historyItem = JSON.parse(existingHistory);
          historyItem.formFill = data;
          localStorage.setItem(historyKey, JSON.stringify(historyItem));
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while filling the form"
      );
    } finally {
      setIsFillingForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <MultiStepLoader
        loadingStates={loadingStates}
        loading={isProcessing}
        duration={1000}
        loop={false}
      />

      <div className="relative glass-card glass-hover rounded-xl p-8">
        <GlowingEffect
          disabled={false}
          proximity={100}
          spread={30}
          blur={2}
          borderWidth={2}
          movementDuration={1.5}
          inactiveZone={0.5}
          className="opacity-60"
        />
        {!file ? (
          <FileUpload onChange={handleFileChange} />
        ) : (
          <div className="text-center space-y-4">
            <div className="flex justify-center">{getFileIcon(file.name)}</div>
            <div>
              <p className="text-lg font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <p className="text-sm text-gray-600 mt-1">{file.type}</p>
            </div>
            <button
              onClick={reset}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Choose different file
            </button>
          </div>
        )}

        {file && !result && (
          <div className="mt-6 text-center">
            <button
              onClick={processDocument}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Document...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Process Document
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-900 mb-2">
                Processing Error
              </h3>
              <p className="text-red-700 mb-3">{error}</p>

              {errorDetails && errorDetails.solution && (
                <div className="bg-white border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-red-900 mb-3">
                    How to Fix This:
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-red-800">
                    <li>{errorDetails.solution.step1}</li>
                    <li>{errorDetails.solution.step2}</li>
                    <li>{errorDetails.solution.step3}</li>
                  </ol>

                  <div className="mt-4 p-3 bg-gray-50 rounded border">
                    <h5 className="font-medium text-gray-900 mb-2">
                      Use this schema file:
                    </h5>
                    <p className="text-sm text-gray-700 mb-2">
                      Upload{" "}
                      <code className="bg-gray-200 px-1 rounded">
                        parking-citation-schema.json
                      </code>{" "}
                      from your project root
                    </p>
                  </div>

                  {errorDetails.alternativeSolution && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <h5 className="font-medium text-blue-900 mb-2">
                        Alternative Solution:
                      </h5>
                      <p className="text-sm text-blue-800">
                        {errorDetails.alternativeSolution}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={reset}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Document Processed Successfully
                </h3>
                <p className="text-sm text-gray-700">
                  Processing completed in {result.processingTime}ms
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50">
            {result.extractedFields.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <ClipboardList className="w-5 h-5 text-gray-900" />
                  <h4 className="text-xl font-bold text-gray-900">
                    Extracted Information
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.extractedFields.map((field, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-4 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold text-gray-900">
                          {field.label}
                        </h5>
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-medium">
                          {(field.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-gray-800 font-mono text-sm bg-gray-50 p-3 rounded border border-gray-200">
                        {field.value || "Not detected"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.rawText && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-gray-900" />
                  <h4 className="text-xl font-bold text-gray-900">
                    Raw Extracted Text
                  </h4>
                </div>
                <div className="bg-white rounded-lg p-4 max-h-64 overflow-y-auto border border-gray-300 shadow-sm">
                  <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono leading-relaxed">
                    {result.rawText}
                  </pre>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={generateAIAppeal}
                disabled={isGeneratingAppeal}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 justify-center"
              >
                {isGeneratingAppeal ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating AI Appeal...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate AI Appeal
                  </>
                )}
              </button>

              <button
                onClick={() => fillForm(true)}
                disabled={isFillingForm}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 justify-center"
              >
                {isFillingForm ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Filling Form...
                  </>
                ) : (
                  <>
                    <Eye className="w-5 h-5" />
                    Preview Form Fill
                  </>
                )}
              </button>

              <button
                onClick={() => fillForm(false)}
                disabled={isFillingForm}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 justify-center"
              >
                <ExternalLink className="w-5 h-5" />
                Fill Form (Silent)
              </button>

              <button
                onClick={reset}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Process Another Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Fill Results */}
      {formFillResult && (
        <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-blue-200">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-200 p-6">
            <div className="flex items-center gap-3">
              <ExternalLink className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="text-lg font-medium text-gray-100">
                  Form Fill Results
                </h3>
                <p className="text-sm text-blue-300">
                  {formFillResult.success
                    ? "Successfully filled form fields"
                    : "Form fill completed with errors"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Filled Fields */}
            {formFillResult.filledFields &&
              formFillResult.filledFields.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-100 mb-4">
                    Filled Fields
                  </h4>
                  <div className="space-y-3">
                    {formFillResult.filledFields.map(
                      (field: any, index: number) => (
                        <div
                          key={index}
                          className={`bg-white/10 backdrop-blur-sm rounded-lg p-3 border-l-4 ${
                            field.success
                              ? "border-green-400"
                              : "border-red-400"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h5 className="font-medium text-gray-100">
                              {field.field}
                            </h5>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                field.success
                                  ? "bg-green-500/20 text-green-300"
                                  : "bg-red-500/20 text-red-300"
                              }`}
                            >
                              {field.success ? "Filled" : "Failed"}
                            </span>
                          </div>
                          <p className="text-gray-200 text-sm font-mono bg-black/20 p-2 rounded">
                            {field.value}
                          </p>
                          {field.selector && (
                            <p className="text-xs text-gray-400 mt-1">
                              Selector: {field.selector}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Screenshots */}
            {formFillResult.screenshots && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-100 mb-4">
                  Form Screenshots
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-200 mb-2">
                      Before Fill
                    </h5>
                    <img
                      src={`data:image/png;base64,${formFillResult.screenshots.before}`}
                      alt="Form before filling"
                      className="w-full rounded-lg border border-white/20"
                    />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-200 mb-2">
                      After Fill
                    </h5>
                    <img
                      src={`data:image/png;base64,${formFillResult.screenshots.after}`}
                      alt="Form after filling"
                      className="w-full rounded-lg border border-white/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Field Mapping Debug Info */}
            {formFillResult.fieldMapping && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-100 mb-4">
                  Field Mapping
                </h4>
                <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4">
                  <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono">
                    {JSON.stringify(formFillResult.fieldMapping, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Agent Progress */}
      {showAgentProgress && (
        <div className="animate-fadeIn">
          <AIAgentProgress steps={agentSteps} currentStep={agentSteps.findIndex(s => s.status === 'in-progress')} />
        </div>
      )}

      {/* AI Appeal Results */}
      {aiAppeal && (
        <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-purple-200">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200 p-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  AI-Generated Appeal
                </h3>
                <p className="text-sm text-gray-700">
                  {aiAppeal.success
                    ? "Multi-agent analysis complete"
                    : "Appeal generation completed"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50">
            {/* Citation Analysis */}
            {aiAppeal.analysis && (
              <div className="mb-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-gray-900" />
                  <h4 className="text-xl font-bold text-gray-900">
                    Citation Analysis
                  </h4>
                </div>
                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Completeness</p>
                      <p className="text-lg font-bold text-gray-900 capitalize">
                        {aiAppeal.analysis.completeness}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Violation Type</p>
                      <p className="text-lg font-bold text-gray-900">
                        {aiAppeal.analysis.violationType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Severity</p>
                      <p className="text-lg font-bold text-gray-900 capitalize">
                        {aiAppeal.analysis.severity}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Appealability</p>
                      <p className="text-lg font-bold text-gray-900 capitalize">
                        {aiAppeal.analysis.appealability}
                      </p>
                    </div>
                  </div>
                  {aiAppeal.analysis.reasoning && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {aiAppeal.analysis.reasoning}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Appeal Strategies */}
            {aiAppeal.strategies && aiAppeal.strategies.length > 0 && (
              <div className="mb-6 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-gray-900" />
                  <h4 className="text-xl font-bold text-gray-900">
                    Recommended Appeal Strategies
                  </h4>
                </div>
                <div className="space-y-3">
                  {aiAppeal.strategies.map((strategy: any, index: number) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-5 border-l-4 border-purple-500 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-bold text-gray-900">
                          {strategy.name}
                        </h5>
                        <span className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full font-semibold">
                          {strategy.probability}% success
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 mb-3 leading-relaxed">
                        {strategy.reasoning}
                      </p>
                      {strategy.keyArguments &&
                        strategy.keyArguments.length > 0 && (
                          <div className="mt-3 bg-blue-50 rounded p-3">
                            <p className="text-xs text-gray-700 font-semibold mb-2">
                              Key Arguments:
                            </p>
                            <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                              {strategy.keyArguments.map(
                                (arg: string, i: number) => (
                                  <li key={i}>{arg}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      {strategy.requiredEvidence &&
                        strategy.requiredEvidence.length > 0 && (
                          <div className="mt-3 bg-amber-50 rounded p-3">
                            <p className="text-xs text-gray-700 font-semibold mb-2">
                              Required Evidence:
                            </p>
                            <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                              {strategy.requiredEvidence.map(
                                (evidence: string, i: number) => (
                                  <li key={i}>{evidence}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Appeal Letter */}
            {aiAppeal.appealLetter && (
              <div className="mb-6 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2 mb-4">
                  <PenTool className="w-5 h-5 text-gray-900" />
                  <h4 className="text-xl font-bold text-gray-900">
                    Generated Appeal Letter
                  </h4>
                </div>
                <div className="bg-white rounded-lg p-6 border-2 border-purple-200 shadow-md">
                  <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans leading-relaxed">
                    {aiAppeal.appealLetter}
                  </pre>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiAppeal.appealLetter);
                      alert("Appeal letter copied to clipboard!");
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors duration-200 text-sm shadow-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Copy className="w-4 h-4" />
                      Copy to Clipboard
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Review */}
            {aiAppeal.review && (
              <div className="mb-6 animate-fadeIn" style={{ animationDelay: '0.7s' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-gray-900" />
                  <h4 className="text-xl font-bold text-gray-900">
                    Quality Review
                  </h4>
                </div>
                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-center bg-purple-50 rounded-lg p-4">
                      <p className="text-4xl font-bold text-purple-600">
                        {aiAppeal.review.score}
                      </p>
                      <p className="text-xs text-gray-600 font-medium mt-1">Quality Score</p>
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${aiAppeal.review.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  {aiAppeal.review.strengths &&
                    aiAppeal.review.strengths.length > 0 && (
                      <div className="mb-3 bg-green-50 rounded-lg p-4">
                        <p className="text-sm font-bold text-green-800 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Strengths:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                          {aiAppeal.review.strengths.map(
                            (strength: string, i: number) => (
                              <li key={i}>{strength}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  {aiAppeal.review.improvements &&
                    aiAppeal.review.improvements.length > 0 && (
                      <div className="mb-3 bg-amber-50 rounded-lg p-4">
                        <p className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Suggested Improvements:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                          {aiAppeal.review.improvements.map(
                            (improvement: string, i: number) => (
                              <li key={i}>{improvement}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  {aiAppeal.review.recommendation && (
                    <p className="text-sm text-gray-800 italic mt-3 pt-3 border-t border-gray-200 bg-blue-50 rounded p-3">
                      <span className="font-semibold text-blue-900">Recommendation:</span> {aiAppeal.review.recommendation}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            {aiAppeal.metadata && (
              <div className="text-center text-sm text-gray-600 bg-purple-50 rounded-lg p-3 animate-fadeIn flex items-center justify-center gap-2" style={{ animationDelay: '0.9s' }}>
                <Sparkles className="w-4 h-4" />
                Powered by <span className="font-semibold">{aiAppeal.metadata.model}</span> • Free & Private • Saved Locally
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
