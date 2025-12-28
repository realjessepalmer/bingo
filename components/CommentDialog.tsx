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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold mb-2">Add Comment</h3>
        <p className="text-sm text-gray-600 mb-4">
          <strong>{cellItem}</strong>
        </p>
        <textarea
          ref={textareaRef}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add gossip about how this was achieved..."
          maxLength={200}
          className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="text-xs text-gray-500 mt-1 text-right">
          {comment.length}/200
        </div>
        <div className="flex gap-2 mt-4">
          {existingComment && (
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

