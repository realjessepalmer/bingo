'use client';

import { useState, useEffect, useRef } from 'react';

interface CommentDialogProps {
  isOpen: boolean;
  cellIndex: number;
  cellItem: string;
  existingComment: string;
  onClose: () => void;
  onSave: (comment: string) => void;
  onDelete: () => void;
}

export default function CommentDialog({
  isOpen,
  cellIndex,
  cellItem,
  existingComment,
  onClose,
  onSave,
  onDelete,
}: CommentDialogProps) {
  const [comment, setComment] = useState(existingComment);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setComment(existingComment);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen, existingComment]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(comment.trim());
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Delete this comment?')) {
      onDelete();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 border border-gray-200 animate-scale-in">
        <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-800">Add Comment</h3>
        <p className="text-sm text-gray-600 mb-4">
          <strong className="text-gray-800">{cellItem}</strong>
        </p>
        <textarea
          ref={textareaRef}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="OK, tell us what happened..."
          maxLength={200}
          className="w-full h-32 p-3 border-2 border-gray-300 rounded-lg resize-none 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-200"
        />
        <div className="text-xs text-gray-500 mt-1 text-right">
          {comment.length}/200
        </div>
        <div className="flex gap-2 sm:gap-3 mt-4">
          {existingComment && (
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white 
                rounded-lg hover:from-red-600 hover:to-red-700 active:scale-95 
                transition-all duration-200 font-semibold shadow-md"
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg 
              hover:bg-gray-300 active:scale-95 transition-all duration-200 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white 
              rounded-lg hover:from-blue-600 hover:to-blue-700 active:scale-95 
              transition-all duration-200 font-semibold shadow-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
