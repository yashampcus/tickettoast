"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Loader2,
  Brain,
  Target,
  Pencil,
  CheckSquare,
} from "lucide-react";

export interface AgentStep {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: "pending" | "in-progress" | "complete" | "error";
  result?: any;
  duration?: number;
}

interface AIAgentProgressProps {
  steps: AgentStep[];
  currentStep: number;
}

export const AIAgentProgress: React.FC<AIAgentProgressProps> = ({
  steps,
  currentStep,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8"
          >
            <Brain className="w-8 h-8 text-purple-600" />
          </motion.div>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-purple-300"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">AI Agents Working</h3>
          <p className="text-sm text-gray-600">
            Multi-agent analysis in progress...
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative flex items-start gap-4 p-4 rounded-lg border-l-4 transition-all ${
              step.status === "complete"
                ? "bg-green-50 border-green-500"
                : step.status === "in-progress"
                  ? "bg-purple-50 border-purple-500"
                  : step.status === "error"
                    ? "bg-red-50 border-red-500"
                    : "bg-gray-50 border-gray-300"
            }`}
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-1">
              {step.status === "complete" ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </motion.div>
              ) : step.status === "in-progress" ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-6 h-6 text-purple-600" />
                </motion.div>
              ) : step.status === "error" ? (
                <div className="w-6 h-6 text-red-600">✗</div>
              ) : (
                <div className="w-6 h-6 text-gray-400">{step.icon}</div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-gray-900">
                  {step.name}
                </h4>
                {step.duration && (
                  <span className="text-xs text-gray-500">
                    {step.duration}ms
                  </span>
                )}
              </div>

              {/* Progress bar for in-progress */}
              {step.status === "in-progress" && (
                <motion.div
                  className="w-full bg-purple-200 rounded-full h-1.5 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="bg-purple-600 h-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </motion.div>
              )}

              {/* Result preview */}
              <AnimatePresence>
                {step.status === "complete" && step.result && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 text-xs text-gray-700 bg-white rounded p-2"
                  >
                    {typeof step.result === "string" ? (
                      <p className="line-clamp-2">{step.result}</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {step.result.count && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                            {step.result.count} items
                          </span>
                        )}
                        {step.result.score && (
                          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            Score: {step.result.score}
                          </span>
                        )}
                        {step.result.status && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {step.result.status}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div className="absolute left-7 top-full w-0.5 h-4 bg-gray-300" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Overall Progress */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Overall Progress
          </span>
          <span className="text-sm font-semibold text-purple-600">
            {steps.filter((s) => s.status === "complete").length} /{" "}
            {steps.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-full"
            initial={{ width: "0%" }}
            animate={{
              width: `${(steps.filter((s) => s.status === "complete").length / steps.length) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
};

export const getDefaultAgentSteps = (): AgentStep[] => [
  {
    id: "analyst",
    name: "Citation Analyst",
    icon: <Brain className="w-6 h-6" />,
    status: "pending",
  },
  {
    id: "strategist",
    name: "Strategy Generator",
    icon: <Target className="w-6 h-6" />,
    status: "pending",
  },
  {
    id: "writer",
    name: "Appeal Writer",
    icon: <Pencil className="w-6 h-6" />,
    status: "pending",
  },
  {
    id: "reviewer",
    name: "Quality Reviewer",
    icon: <CheckSquare className="w-6 h-6" />,
    status: "pending",
  },
];
