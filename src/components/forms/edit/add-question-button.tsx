"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface AddQuestionButtonProps {
  onAddQuestion?: () => void;
}

export default function AddQuestionButton({ onAddQuestion }: AddQuestionButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onAddQuestion}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        w-full group relative overflow-hidden rounded-xl border-2 border-dashed
        transition-all duration-200 ease-out py-6
        ${isHovered 
          ? 'border-primary bg-primary/5 shadow-md' 
          : 'border-primary/30 bg-transparent hover:border-primary/50'
        }
      `}
    >
      <div className="flex items-center justify-center gap-3">
        {/* Plus Icon */}
        <div
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200
            ${isHovered 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-primary/10 text-primary'
            }
          `}
        >
          <Plus className="h-5 w-5" />
        </div>

        {/* Text */}
        <span
          className={`
            font-medium text-base transition-colors duration-200
            ${isHovered 
              ? 'text-primary' 
              : 'text-primary/70'
            }
          `}
        >
          Add Question
        </span>
      </div>
    </button>
  );
}
